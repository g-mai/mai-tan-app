import { PutObjectCommand } from "@aws-sdk/client-s3";
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
import { authSchema, team } from "#/lib/db/schema";
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

export async function resizeToSquare(file: File, size = 300): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const offsetX = (bitmap.width - side) / 2;
  const offsetY = (bitmap.height - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(bitmap, offsetX, offsetY, side, side, 0, 0, size, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], file.name, { type: "image/webp" }))
          : reject(new Error("Canvas toBlob failed")),
      "image/webp",
      0.85,
    ),
  );
}

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
