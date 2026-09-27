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
import { getR2 } from "#/lib/storage/r2.server";

const uploadImageSchema = z.object({
  prefix: z.enum(["avatars", "orgs", "teams"]),
  entityId: z.string().min(1),
  file: z
    .file()
    .min(1, "File is empty")
    .max(5 * 1024 * 1024, "File size exceeds limit of 5MB")
    .mime(["image/jpeg", "image/png", "image/webp"], "Unsupported file type"),
});

export const uploadImage = createServerFn({
  method: "POST",
})
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data");
    return uploadImageSchema.parse({
      prefix: data.get("prefix"),
      entityId: data.get("entityId"),
      file: data.get("file"),
    });
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { prefix, entityId, file } = data;
    await checkUploadAuthorization(prefix, entityId, context.session);
    const { bucket, publicUrl } = getR2();
    const fileExtension = file.type.split("/")[1];
    const key = `${prefix}/${entityId}/${nanoid()}.${fileExtension}`;

    try {
      await bucket.put(key, file, {
        httpMetadata: { contentType: file.type },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }

    return { publicUrl: `${publicUrl}/${key}` };
  });

const deleteImageSchema = uploadImageSchema.omit({ file: true }).extend({
  imageUrl: z.url(),
});

export const deleteImage = createServerFn({
  method: "POST",
})
  .validator(deleteImageSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { imageUrl, prefix, entityId } = data;
    await checkUploadAuthorization(prefix, entityId, context.session);
    const { bucket, publicUrl } = getR2();
    const url = new URL(imageUrl);
    const baseUrl = new URL(`${publicUrl}/`);

    // External images (for example, OAuth avatars) are not managed by this bucket.
    if (
      url.origin !== baseUrl.origin ||
      !url.pathname.startsWith(baseUrl.pathname)
    ) {
      return;
    }

    const key = decodeURIComponent(url.pathname.slice(baseUrl.pathname.length));
    if (
      !key.startsWith(`${prefix}/${entityId}/`) ||
      key.split("/").length !== 3
    ) {
      throw new Error("Unauthorized to delete this image");
    }

    try {
      await bucket.delete(key);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  });

async function checkUploadAuthorization(
  prefix: z.infer<typeof uploadImageSchema>["prefix"],
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
