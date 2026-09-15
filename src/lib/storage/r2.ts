import { S3Client } from "@aws-sdk/client-s3";
import { env } from "#/lib/env.server";

let client: S3Client | undefined;

export function getR2() {
  const {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET_NAME: bucketName,
    R2_PUBLIC_URL: publicUrl,
  } = env;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
  ) {
    throw new Error(
      "Image storage is not configured. Set all R2_* variables to enable uploads.",
    );
  }

  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, bucketName, publicUrl };
}
