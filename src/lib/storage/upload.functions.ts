import { createServerFn } from "@tanstack/react-start";
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
    const { prefix, entityId, fileType, fileSize } = data;
  });
