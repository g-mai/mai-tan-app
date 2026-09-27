import { env as bindings } from "cloudflare:workers";
import { env } from "#/lib/env.server";

export function getR2() {
  const bucket = bindings.IMAGES;
  const publicUrl = env.R2_PUBLIC_URL?.replace(/\/+$/, "");

  if (!bucket || !publicUrl) {
    throw new Error(
      "Image storage is not configured. Set the IMAGES binding and R2_PUBLIC_URL to enable uploads.",
    );
  }

  return { bucket, publicUrl };
}
