import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Browser-exposed configuration from `.env`, inlined into the bundle by Vite.
// Readable from both server and client code; anything secret belongs in
// `env.server.ts` instead.
export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_APP_URL: z.url().optional(),
    VITE_SENTRY_DSN: z.url().optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
