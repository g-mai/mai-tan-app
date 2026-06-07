import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import { authMiddleware } from "#/features/auth/middleware";
import type { Session } from "#/features/auth/types";
import { db } from "#/lib/db";
import { team } from "#/lib/db/schema";
import { env } from "#/lib/env";
import { r2 } from "#/lib/storage/r2";

const getPresignedUploadImgUrlSchema = z.object({
  prefix: z.enum(["avatars", "orgs", "teams"]),
  entityId: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

export const getPresignedUploadImgUrl = createServerFn({
  method: "POST",
})
  .inputValidator(getPresignedUploadImgUrlSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    try {
      const { prefix, entityId, fileType, fileSize } = data;

      // validation: check file size limits and allowed file types
      const fileSizeLimit = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (fileSize > fileSizeLimit) {
        throw new Error("File size exceeds limit of 5MB");
      }
      if (!allowedTypes.includes(fileType)) {
        throw new Error("Unsupported file type");
      }

      // authorization check: check user has permissions
      const session = context.session;
      await checkUploadAuthorization(prefix, entityId, session);

      // generate unique key and presigned URL
      const bucketName = env.R2_BUCKET_NAME;
      const fileExtension = fileType.split("/")[1];
      const key = `${prefix}/${entityId}/${nanoid()}.${fileExtension}`;
      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: fileType,
          ContentLength: fileSize,
        }),
      );
      return {
        uploadUrl: signedUrl,
        publicUrl: `${env.R2_PUBLIC_URL}/${key}`,
      };
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      throw new Error("Failed to generate presigned URL");
    }
  });

const deleteImageSchema = z.object({
  imageUrl: z.string(),
  prefix: z.enum(["avatars", "orgs", "teams"]),
  entityId: z.string(),
});

export const deleteImage = createServerFn({
  method: "POST",
})
  .inputValidator(deleteImageSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    try {
      const { imageUrl, prefix, entityId } = data;
      const session = context.session;

      // extract prefix and entityId from URL for authorization check
      const url = new URL(imageUrl);

      await checkUploadAuthorization(prefix, entityId, session);

      const bucketName = env.R2_BUCKET_NAME;
      const key = url.pathname.substring(1); // remove leading '/'
      await r2.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  });

async function checkUploadAuthorization(
  prefix: z.infer<typeof getPresignedUploadImgUrlSchema>["prefix"],
  entityId: string,
  session: Session,
) {
  if (prefix === "avatars") {
    if (entityId !== session.user.id) {
      throw new Error("Unauthorized to upload avatar for this user");
    }
  } else if (prefix === "orgs") {
    const { error, success } = await auth.api.hasPermission({
      headers: getRequestHeaders(),
      body: {
        organizationId: entityId,
        permissions: {
          organization: ["update"],
        },
      },
    });

    if (error || !success) {
      throw new Error("Unauthorized to upload for this organization");
    }
  } else if (prefix === "teams") {
    const result = await db
      .select()
      .from(team)
      .where(eq(team.id, entityId))
      .limit(1);

    // drizzle Relational Queries v2 - WIP
    // TODO: check back on drizzle 1.0 launch if better-auth started supporting it
    // const teamData = db.query.team.findFirst({
    //   where: {
    //     id: entityId,
    //   },
    // });

    if (!result[0]) {
      throw new Error("Team not found");
    }
    const { error, success } = await auth.api.hasPermission({
      headers: getRequestHeaders(),
      body: {
        organizationId: result[0].organizationId,
        permissions: {
          team: ["update"],
        },
      },
    });
    if (error || !success) {
      throw new Error("Unauthorized to upload for this team");
    }
  }
}
