import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Node-only configuration from `.env`, used by build and database tooling.
// These tools run outside the Vite client and Cloudflare Worker runtimes, so
// their values do not belong in `env.public.ts` or `env.server.ts`.
export const toolingEnv = createEnv({
  server: {
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
    CLOUDFLARE_DATABASE_ID: z.string().min(1).optional(),
    CLOUDFLARE_D1_TOKEN: z.string().min(1).optional(),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export function getRemoteD1Credentials() {
  const {
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_DATABASE_ID: databaseId,
    CLOUDFLARE_D1_TOKEN: token,
  } = toolingEnv;

  if (!accountId && !databaseId && !token) return undefined;

  if (!accountId || !databaseId || !token) {
    throw new Error(
      "Remote D1 configuration is incomplete. Set all CLOUDFLARE_* variables.",
    );
  }

  return { accountId, databaseId, token };
}
