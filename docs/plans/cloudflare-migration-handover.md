# Cloudflare Workers + D1 migration — handover

Execution steps only. Rationale is in `cloudflare-workers-migration.md`.

Work on branch `cloudflare-migration`. The app has no real users; the database is re-seeded,
not migrated. Run `pnpm check` and `pnpm test` before each commit.

**Values to collect before starting**

| Value | Where from |
| ----- | ---------- |
| Cloudflare account ID | Dashboard sidebar |
| D1 database ID | Output of step 2.1 |
| D1 API token | Dashboard → API Tokens, with D1 Edit permission |

---

## 1. Dependencies

```bash
pnpm remove @netlify/vite-plugin-tanstack-start pg @types/pg
pnpm add -D @cloudflare/vite-plugin wrangler
```

pnpm will add a placeholder under `allowBuilds` in `pnpm-workspace.yaml` because
`strictDepBuilds: true`. Resolve it or every script fails:

```yaml
allowBuilds:
  # Cloudflare's Workers runtime — its postinstall fetches the workerd binary,
  # which `vite dev` and `wrangler` both need locally.
  workerd: true
```

Then:

```bash
wrangler login
```

---

## 2. Create the D1 database

```bash
wrangler d1 create mai-tan-db
```

Record the `database_id` from the output.

---

## 3. `wrangler.jsonc` (new file, repo root)

```jsonc
{
  "name": "mai-tan-app",
  "main": "@tanstack/react-start/server-entry",
  "compatibility_date": "2026-09-12",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "dist/client" },
  "observability": { "enabled": true },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "mai-tan-db",
      "database_id": "<from step 2>",
      "migrations_dir": "src/lib/db/drizzle"
    }
  ]
}
```

Do not lower `compatibility_date` below `2025-04-01`. Secrets reach `process.env` only via
`nodejs_compat_populate_process_env`, which that date enables.

Generate binding types:

```bash
wrangler types
```

---

## 4. `vite.config.ts` (replace whole file)

```ts
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    devtools(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        routes: ["/", "/login", "/register", "/forgot-password"],
      },
    }),
    viteReact(),
  ],
});
```

`cloudflare()` must be first. Do not add `/reset-password` to `prerender.routes`.

---

## 5. Port the schema to SQLite

### 5.1 Switch the adapter provider

In `src/features/auth/lib/auth.ts`, change `provider: "pg"` to `provider: "sqlite"` inside
`drizzleAdapter`. Leave the rest of the config alone.

### 5.2 Regenerate the schema

```bash
pnpm db:auth-generate
```

Review the diff against `src/lib/db/auth-schema.ts`. Expected changes:

| Before | After |
| ------ | ----- |
| `pgTable` from `drizzle-orm/pg-core` | `sqliteTable` from `drizzle-orm/sqlite-core` |
| `boolean("x")` | `integer("x", { mode: "boolean" })` |
| `timestamp("x")` | `integer("x", { mode: "timestamp" })` |
| `.defaultNow()` | `.$defaultFn(() => new Date())` |

`text` columns, `primaryKey`, `index`, `uniqueIndex`, `relations` and cascade rules are
unchanged. If the generator drops an index or a cascade, restore it by hand and diff against
git history.

`src/lib/db/schema.ts` needs no change.

### 5.3 Rewrite `src/lib/db/index.ts`

```ts
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export const db = drizzle(env.DB, { schema });
```

This is the only file in the app allowed to import `cloudflare:workers`. Every existing
`import { db } from "#/lib/db"` keeps working.

### 5.4 `src/lib/env.ts`

Delete the `DATABASE_URL` line from the Zod schema. Leave everything else.

---

## 6. Migrations

### 6.1 Replace `drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/lib/db/drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID as string,
    token: process.env.CLOUDFLARE_D1_TOKEN as string,
  },
});
```

### 6.2 Reset the migration history

```bash
rm -rf src/lib/db/drizzle
pnpm db:generate
```

This writes a fresh SQLite baseline. The eight Postgres migrations are discarded on purpose.

### 6.3 Apply

```bash
pnpm db:migrate:local     # Miniflare
pnpm db:migrate:remote    # Cloudflare
```

Scripts are defined in step 9.

---

## 7. Seeding

`src/lib/db/seed.ts` imports the `auth` instance and creates users through
`auth.api.signUpEmail`, so it must run inside the Workers runtime. It becomes a dev-only
route.

### 7.1 Create `src/routes/api/dev/seed.ts`

A POST handler that calls the existing seed logic. Guard the body with `import.meta.env.DEV`
so Vite eliminates it from the production build:

```ts
if (!import.meta.env.DEV) {
  return new Response("Not found", { status: 404 });
}
```

Move the reusable parts of `src/lib/db/seed.ts` into a function the route imports. Keep
`src/lib/db/seed-data.ts` as it is. Accept a `reset` flag to preserve the `db:reset`
behaviour.

`process.env.SKIP_VERIFICATION_EMAIL = "true"` must still be set before seeding so Resend is
not called.

### 7.2 Verify the guard

After `pnpm build`, grep the server bundle in `dist/` for a string unique to the seed logic,
for example a seeded user's email from `seed-data.ts`. It must not appear. If it does, the
guard did not eliminate the code and the route must not be deployed.

### 7.3 Seeding the remote database

Seed locally first, then copy up:

```bash
wrangler d1 export mai-tan-db --local --output=seed.sql
wrangler d1 execute mai-tan-db --remote --file=seed.sql
```

This keeps real password hashes and needs no production code path. Delete `seed.sql`
afterwards; do not commit it.

---

## 8. Remove the purge job

Delete:

- `src/lib/db/purge-abandoned.ts`
- the `db:purge-abandoned` script in `package.json`
- `docs/dev/maintenance.md`
- the `pnpm db:purge-abandoned` line in `README.md` (line 268)

Fix the sentence in `src/routes/_protected/docs/changelog.tsx` (around line 88) that says a
maintenance job clears abandoned registrations. It is user-facing copy and will be false.

This orphans `src/features/auth/lib/abandoned-registration.ts` and
`src/features/auth/lib/abandoned-registration.test.ts`, which nothing else imports. Delete
both unless the rule is wanted later. Run `pnpm knip` afterwards to confirm nothing else is
left dangling.

---

## 9. `package.json` scripts

Replace the `dev` script and the database block:

```json
"dev": "vite dev --port 3000",
"deploy": "vite build && wrangler deploy",
"db:generate": "drizzle-kit generate",
"db:migrate:local": "wrangler d1 migrations apply mai-tan-db --local",
"db:migrate:remote": "wrangler d1 migrations apply mai-tan-db --remote",
"db:auth-generate": "npx auth generate --config ./src/features/auth/lib/auth.ts",
"db:studio": "drizzle-kit studio"
```

Removed: `db:migrate`, `db:push`, `db:pull`, `db:seed`, `db:reset`, `db:purge-abandoned`, and
the `docker compose up -d` and `NODE_OPTIONS` parts of `dev`.

Invoke deployment as `pnpm run deploy`, not `pnpm deploy`.

---

## 10. Local development

```bash
rm docker-compose.yml
```

Remove `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and `DATABASE_URL` from `.env` and
from `.env.example` if present. Update `docs/dev/onboarding.md` to drop the Docker step.

Add to `.gitignore` (currently only `.env` is listed):

```
.dev.vars
.wrangler/
```

Put local non-secret values in `.dev.vars`. The Vite plugin reads it automatically.

First run:

```bash
pnpm db:generate
pnpm db:migrate:local
pnpm dev
curl -X POST http://localhost:3000/api/dev/seed
```

Inspect the local database with:

```bash
wrangler d1 execute mai-tan-db --local --command "select email from user"
```

If `vite dev` and `wrangler dev` turn out not to share local state, add `--persist-to` to
both with the same path.

---

## 11. Delete Netlify config

```bash
rm netlify.toml
```

Do not migrate its `pnpm db:migrate && vite build` command. Migrations are a deliberate step.

---

## 12. Sentry

Remove `NODE_OPTIONS='--import ./instrument.server.mjs'` from the `dev` script (done in step
9). `@sentry/*` is not imported anywhere in `src/`, so nothing else changes. Do not attempt
to load the Node SDK in the Worker; it needs `@sentry/cloudflare`.

---

## 13. Delete the health route

```bash
rm src/routes/api/health.ts
```

It exists for the Netlify warm-up ping. Skip this only if a manual health check is wanted.

---

## 14. Secrets

Set these before the first deploy. `src/lib/env.ts` parses at module scope, so a missing
value fails Worker startup validation during `wrangler deploy`.

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
wrangler secret put RESEND_API_KEY
wrangler secret put FROM_ADDRESS_EMAIL
wrangler secret put ADMIN_EMAIL
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_BUCKET_NAME
wrangler secret put R2_PUBLIC_URL
```

`DATABASE_URL` is not set; the database is a binding.

`VITE_APP_URL` is **not** a secret. Vite inlines it at build time, so it must be present in
the environment that runs `vite build`. `wrangler secret put VITE_APP_URL` has no effect.

---

## 15. Deploy

```bash
pnpm db:migrate:remote
pnpm run deploy
```

Then point DNS at the Worker. The domain is already behind Cloudflare, so this is a routing
change, not a nameserver change. Leave the Netlify deployment running.

---

## 16. Verification

Run every row. Anonymous paths first.

| Check | Expected |
| ----- | -------- |
| `/` | 200, landing page renders |
| `/login`, `/register`, `/forgot-password` | 200 |
| `/` and `/login` in Workers analytics | No Worker invocation (served as static assets) |
| `/dashboard`, `/settings`, `/organizations`, `/teams` | 307 to `/login` |
| `/onboarding/*` | 307 to `/login` |
| `/register/password` | 307 to `/register` |
| `/api/dev/seed` in production | 404 |
| Sign-up | Succeeds and is not slow |
| Sign-in | Succeeds |
| Password reset email | Delivered via Resend |
| Image upload | R2 presigned URL still works |
| Create an organization, then a team | Succeeds |
| Invite a member | Invitation email sends, link resolves |
| 5+ consecutive requests to `/dashboard` | All succeed |
| CPU p99 in Workers observability | Under 10 ms to stay on the Free plan |
| Cold TTFB after 30 min idle | Under 1 s |

Measure the last row with:

```bash
curl -o /dev/null -w '%{time_starttransfer}\n' https://<domain>/
```

Baseline to beat: 5.7 s.

The organization and team rows are not routine. The Better Auth organization plugin with
teams is much better travelled on Postgres than on SQLite; this is the first time this app
runs it there.

---

## 17. After cutover

- Keep the Netlify site deployed for one week.
- The Netlify Postgres database holds the old data and cannot be synced back, because the
  dialect changed. Rollback is DNS plus reverting the migration commit, and loses anything
  created on D1 after cutover.
- Delete the Netlify site and database once D1 is confirmed.
- Update `README.md` and `docs/dev/onboarding.md` for the new setup: no Docker, `wrangler`
  required, seeding via the dev route.

---

## Known unknowns

Two things in this handover were not verified against a running system. Check them when you
reach them rather than assuming.

1. **Local state sharing.** Whether `@cloudflare/vite-plugin` and `wrangler dev` use the same
   local D1 directory. Fallback is `--persist-to` on both (step 10).
2. **`import.meta.env.DEV` elimination.** Whether the seed route body is actually removed from
   the production bundle. Step 7.2 is the check, and it gates deploying that route at all.

## Deliberately out of scope

- **R2 native binding.** Would remove ~4.4 MB of AWS SDK, but `getPresignedUploadImgUrl`
  needs presigned URLs, which the binding does not provide. Keep `@aws-sdk/client-s3`.
- **Custom password hashing.** Only if sign-up is slow or fails on Workers. See
  `better-auth#8860`.
- **Better Auth telemetry flag.** Does nothing; telemetry is already off by default and the
  import is static.
- **CI.** `.github/workflows/ci.yml` is host-agnostic.
- **Tests.** All 11 test files are jsdom unit tests and none touch the database.
