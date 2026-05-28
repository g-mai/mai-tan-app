import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import z from "zod";
import { authMiddleware } from "#/features/auth/middleware";
import { r2 } from "#/lib/storage/r2";

const getPresignedUploadUrlSchema = z.object({
  prefix: z.enum(["avatars", "orgs", "teams"]),
  entityId: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

export const getPresignedUploadUrl = createServerFn({
  method: "POST",
})
  .inputValidator(getPresignedUploadUrlSchema)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    try {
      console.log("NanoID:", nanoid());
      const { prefix, entityId, fileType, fileSize } = data;
      // TODO: validation: check file size limits, allowed file types, etc.
      const bucketName = process.env.R2_BUCKET_NAME;
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
        publicUrl: `${process.env.R2_PUBLIC_URL}/${process.env.R2_BUCKET_NAME}/${key}`,
      };
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      throw new Error("Failed to generate presigned URL");
    }
  });
