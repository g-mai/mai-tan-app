import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Worker runtime secrets, validated at import. Wrangler loads them from
// `.dev.vars` locally and from Worker secrets in production; the build-time
// prerender runs the Worker too, so CI copies `.dev.vars.example` before
// building. Never import this from client code — see `env.public.ts`.
export const env = createEnv({
  server: {
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET_NAME: z.string().min(1).optional(),
    R2_PUBLIC_URL: z.url().optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    FROM_ADDRESS_EMAIL: z.string().min(1).optional(),
    ADMIN_EMAIL: z.email().optional(),
    SKIP_VERIFICATION_EMAIL: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
