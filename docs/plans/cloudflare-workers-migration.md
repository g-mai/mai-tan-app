# Migrate hosting to Cloudflare Workers + D1

> Moves the app off Netlify Functions onto Cloudflare Workers, and off Postgres onto
> Cloudflare D1. Written 2026-09-12 against commit `d238480`, revised the same day after
> review. Nothing in this plan has been applied yet.

## Overview

| Concern | Today | After |
| ------- | ----- | ----- |
| SSR runtime | Netlify Functions (AWS Lambda) | Cloudflare Workers (V8 isolates) |
| Database | Netlify DB (Neon Postgres), sleeps at 5 min | Cloudflare D1 (SQLite), no sleep |
| DB access | `pg` over TCP, module-scope pool | D1 binding, no connection at all |
| Local database | Docker Compose Postgres | Miniflare local D1 |
| Seeding | `tsx` script | Dev-only server route |
| Purge job | `tsx` script, run daily | Removed |
| Cold start | 5.7 s | None by architecture |
| Keeping warm | Scheduled ping required | Not applicable |
| Cost | Free, 300-credit hard cap | Workers Free to start, $5/month only if CPU forces it |
| Build plugin | `@netlify/vite-plugin-tanstack-start` | `@cloudflare/vite-plugin` + `wrangler` |

The app has **no real users**, so this is a re-seed, not a data migration. That is what makes
changing database engines cheap today and expensive later.

---

## Why

Measured on the live site before migrating:

| Measurement | Cold | Warm |
| ----------- | ---- | ---- |
| Server TTFB | 5.7–6.8 s | 0.22–0.76 s |
| Full page load of `/dashboard` | 9.2 s | 0.77 s |
| First database query | 3.6 s | 0.45–0.77 s |

The cold start is not an idle-timeout problem. Firing 8 concurrent requests at an
already-warm function produced 4 responses under 0.76 s and 4 fresh instances at 5.7 s, so
cold starts are **per instance**. Warming one instance with a ping helps the common case but
is not a real fix.

The root cause is module resolution, not application code. A cold start resolves 1,071
modules, 1,056 of them individual files across 23 `node_modules` packages. A CPU profile of
startup is dominated by `package_json_reader`, not by anything we wrote.

Workers removes the problem rather than mitigating it: isolates have no container to keep
warm, so there is nothing to ping and no credit budget to manage.

### Which Workers plan

Measured steady-state SSR cost per request, on a Ryzen 7 5700X3D:

| Route | Median CPU | p90 | Max |
| ----- | ---------- | --- | --- |
| `/login` | 2.3 ms | 4.0 ms | 10.0 ms |
| `/` | 4.0 ms | 6.1 ms | 20.5 ms |

The Workers **Free** plan caps CPU at 10 ms per invocation and requests at 100,000/day.
**Paid** raises CPU to 30 s (5 min max) and removes the request cap. CPU is the only
dimension on which the free plan is worse for this app:

- **Bundle size stopped mattering on 2026-09-04.** Both plans allow 64 MiB uncompressed. The
  old 3 MB (free) / 10 MB (paid) gzip caps are gone.
- **Smart Placement is free**, and is the default for any Worker created or redeployed after
  2026-03-24. With D1 this matters less than it would with a hosted Postgres, but it is free.
- **Static assets are unmetered on both plans.** The 100,000/day free cap only counts
  requests that actually reach the Worker.

So the question is narrow: does a render exceed 10 ms of CPU on a Workers core? On the
desktop numbers it would be close, and Workers cores are not faster. But the tail belongs
almost entirely to the anonymous marketing and auth pages, and those need no per-request
render at all.

**Prerender them.** Cloudflare shipped static prerendering support for TanStack Start in
December 2025. A prerendered route is served from Workers Assets and never invokes the
Worker: no CPU charged, no request counted, nothing to exceed.

This plan therefore starts on **Free**, prerenders the anonymous pages, and reads real CPU
percentiles from Workers observability before paying anything. Upgrading is one click and
there are no users, so being wrong costs nothing. CPU exhaustion surfaces as **Error 1102**
(`1101` is an uncaught JavaScript exception, a different failure).

### A separate limit: startup time

Both plans cap Worker startup at **1 s**, raised from 400 ms in October 2025. This is not the
per-request CPU budget; it is the one-off cost of evaluating the top-level module graph.
`@aws-sdk/client-s3` is ~4.4 MB of that graph. If `wrangler deploy` fails validation, this is
the first suspect, and step 5c is the way out.

### Why D1 rather than a hosted Postgres

Workers cannot host Postgres, and the 3.6 s first-query delay follows the database rather
than the host. Both hosted options were evaluated and both keep a version of the problem:

| | Neon Free | Supabase Free | D1 Free |
| --- | --- | --- | --- |
| Idle behaviour | Suspends after 5 min, cannot be disabled | Pauses after 7 days | Never |
| Waking | Automatic | Manual restore from the dashboard | Not applicable |
| Compute budget | 100 CU-hours per project per month | Not metered | Not metered |
| Storage | 0.5 GB | 500 MB | 500 MB per database, 5 GB per account |
| Connection model | TCP, or HTTP driver | TCP only | Binding |

Neon is out because free-plan scale-to-zero cannot be disabled, and a 4-minute keep-alive
cron would burn roughly 180 CU-hours a month against 100 included. It would also be the same
engine behind the 3.6 s measured today.

Supabase stays warm inside a 7-day window, but its free direct connection is IPv6-only, a
paused project has to be restored by hand, and `pg` over TCP forces a per-request connection
refactor across every module that imports `db`.

D1 removes the whole category. It is a binding, not a connection: no pool, no socket
lifecycle, no `Cannot perform I/O on behalf of a different request`, no keep-alive cron, and
no cold database. It also deletes Docker from local development.

Two things make the port cheap here specifically:

- **The schema is already portable.** `src/lib/db/auth-schema.ts` uses only `text`,
  `integer`, `boolean`, `timestamp`, `primaryKey` and indexes. No `uuid`, `jsonb`, arrays or
  enums. Better Auth generates string primary keys already.
- **Better Auth never opens a transaction on this codebase.** In
  `@better-auth/drizzle-adapter` 1.7.2 every `db.transaction()` call site is guarded by
  `config.provider === "mysql"`, and the adapter-level transaction capability is
  `config.transaction ?? false`, which `auth.ts` does not enable. Nothing in `src/` calls
  `db.transaction()` either. Re-check this on any Better Auth upgrade.

The accepted cost is lock-in. D1 is Cloudflare-only, and leaving means a dialect migration
rather than a connection string change. That is a deliberate choice: R2 and DNS are already
Cloudflare, so a single-platform stack is a feature of this starter rather than a constraint.

Free-plan D1 allowances, for reference:

| Limit | Free |
| ----- | ---- |
| Rows read per day | 5 million |
| Rows written per day | 100,000 |
| Database size | 500 MB |
| Databases per account | 10 |
| Queries per Worker invocation | 50 |
| Time Travel (point-in-time recovery) | 7 days |

---

## Prerequisites

1. Cloudflare account. Start on **Workers Free**; no payment is needed to deploy.
2. `wrangler login` completed locally.
3. A Cloudflare API token with D1 edit permission, for `drizzle-kit` against the remote
   database. Note the account ID and, after step 1, the database ID.

---

## Step 1 — Create the database and port the schema

### 1a. Create the D1 database

```bash
wrangler d1 create mai-tan-db
```

Keep the `database_id` it prints; it goes into `wrangler.jsonc` in step 2.

### 1b. Regenerate the schema for SQLite

Change the adapter provider in `src/features/auth/lib/auth.ts`:

```ts
database: drizzleAdapter(db, {
  provider: "sqlite",
  schema: authSchema,
}),
```

Then regenerate with `pnpm db:auth-generate` and review the diff. The mechanical changes are:

| Postgres | SQLite |
| -------- | ------ |
| `pgTable` from `drizzle-orm/pg-core` | `sqliteTable` from `drizzle-orm/sqlite-core` |
| `boolean("x")` | `integer("x", { mode: "boolean" })` |
| `timestamp("x")` | `integer("x", { mode: "timestamp" })` |
| `.defaultNow()` | `.$defaultFn(() => new Date())` |

`text` columns, `primaryKey`, `index`, `uniqueIndex`, `relations` and the cascade rules carry
over unchanged. The adapter already normalises date fields on read via
`customTransformOutput`, so `Date` objects still come back from queries.

Setting `provider: "sqlite"` also flips Better Auth's `supportsUUIDs`, `supportsJSON` and
`supportsArrays` to `false`. Nothing in this app relies on them, but that is the flag to
remember if a plugin later complains.

### 1c. Migrations

Replace `drizzle.config.ts`:

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

Delete the eight existing Postgres migrations in `src/lib/db/drizzle/` along with `meta/`,
and generate a fresh SQLite baseline with `pnpm db:generate`. There is no data to preserve.

Migrations are then **applied by wrangler**, not by `drizzle-kit migrate`, so that the same
command works against the local Miniflare database and the remote one:

```bash
wrangler d1 migrations apply mai-tan-db --local
wrangler d1 migrations apply mai-tan-db --remote
```

This requires `migrations_dir` in `wrangler.jsonc` to point at `src/lib/db/drizzle`.
Keep `db:generate` as the generate step and drop `db:migrate`, `db:push` and `db:pull`, which
no longer have a connection string to talk to.

### 1d. `src/lib/db/index.ts`

This is the only file in the app that touches `cloudflare:workers`:

```ts
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export const db = drizzle(env.DB, { schema });
```

Bindings have been importable from the global scope since March 2025, so this works at module
scope and **every existing `import { db } from "#/lib/db"` keeps working unchanged**. That is
the main reason D1 is cheaper than the Postgres options: there is no per-request client to
thread through the app.

The one caveat: you may reference a binding at top level but not perform I/O with it there.
`drizzle()` only wraps the binding, so this is fine. If it ever misbehaves, moving the
`drizzle()` call inside a request is free, because it allocates nothing.

Add the binding type so `env.DB` typechecks:

```bash
wrangler types
```

### 1e. `src/lib/env.ts`

Drop `DATABASE_URL` from the Zod schema. Everything else in that file stays on `process.env`
and keeps working (see step 6).

---

## Step 2 — Cloudflare tooling and build config

### Dependencies

```bash
pnpm remove @netlify/vite-plugin-tanstack-start pg @types/pg
pnpm add -D @cloudflare/vite-plugin wrangler
```

`pg` goes because nothing imports it any more. `drizzle-orm` stays; only the driver import
changes.

This pulls in `workerd`, whose postinstall fetches the runtime binary. Because
`pnpm-workspace.yaml` sets `strictDepBuilds: true`, pnpm will add a placeholder under
`allowBuilds` that **must** be resolved or every script fails:

```yaml
allowBuilds:
  # Cloudflare's Workers runtime — its postinstall fetches the workerd binary,
  # which `vite dev` and `wrangler` both need locally.
  workerd: true
```

### `vite.config.ts`

The Cloudflare plugin must come **first**, and it needs `viteEnvironment.name` set to `ssr`
so the Worker is used for server-side rendering rather than as a separate entry.

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

The `prerender` block is what keeps the free plan viable. Those four routes render to static
HTML at build time and are served from Workers Assets, so they never invoke the Worker.
Verify each one actually prerenders: a route that reads request state during render cannot
be, and `/reset-password` is excluded deliberately because it is reached with a token.

### `wrangler.jsonc` (new)

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
      "database_id": "<from step 1a>",
      "migrations_dir": "src/lib/db/drizzle"
    }
  ]
}
```

`nodejs_compat` is still required, not for `pg` any more but for Better Auth's `node:crypto`
use and the AWS SDK. Two version notes that matter:

- Compatibility dates from **2026-08-04** enable `nodejs_compat` and `nodejs_compat_v2` by
  default. Listing the flag explicitly is still clearer.
- Dates from **2025-04-01** enable `nodejs_compat_populate_process_env`, which is what puts
  vars and secrets on `process.env`. This is the reason `src/lib/env.ts` can keep parsing
  `process.env` at module scope. **Do not lower the compatibility date below this.**

`observability` is on because step 7 depends on reading real CPU percentiles.

### Delete `netlify.toml`

Its build command is `pnpm db:migrate && vite build`. Migrations must not run inside a
Workers build; they are a deliberate `wrangler d1 migrations apply` step.

### `package.json` scripts

```json
"dev": "vite dev --port 3000",
"deploy": "vite build && wrangler deploy",
"db:generate": "drizzle-kit generate",
"db:migrate:local": "wrangler d1 migrations apply mai-tan-db --local",
"db:migrate:remote": "wrangler d1 migrations apply mai-tan-db --remote",
"db:studio": "drizzle-kit studio"
```

`dev` loses `docker compose up -d` (step 3). The Sentry `NODE_OPTIONS` import also goes; see
step 5c. Invoke deployment as `pnpm run deploy`, since `deploy` is also a built-in pnpm
command and the explicit `run` removes the ambiguity.

---

## Step 3 — Local development with Miniflare

The Cloudflare Vite plugin runs the app inside `workerd` via Miniflare in dev, the same
runtime as production. The `DB` binding resolves to a local SQLite file under `.wrangler/`,
created on first use and persisted between runs.

1. Delete `docker-compose.yml`, and drop `POSTGRES_USER`, `POSTGRES_PASSWORD` and
   `POSTGRES_DB` from `.env` and from the onboarding docs.
2. Add `.wrangler/` and `.dev.vars` to `.gitignore`, which currently lists only `.env`.
3. Apply migrations locally before the first `pnpm dev`:

```bash
pnpm db:generate
pnpm db:migrate:local
```

Non-secret local values go in `.dev.vars`, which the plugin reads automatically. To start
from a clean database, delete the local state directory and re-apply migrations.

Confirm that `vite dev` and `wrangler dev` share the same local state directory before
relying on it; if they diverge, standardise on `--persist-to` in both.

`wrangler d1 execute mai-tan-db --local --command "select ..."` is the quickest way to
inspect the local database without leaving the terminal.

---

## Step 4 — The two scripts that can no longer run in Node

`db:seed` and `db:purge-abandoned` run under `tsx` in plain Node today. Both import
`#/lib/db`, which now imports `cloudflare:workers`, which does not exist outside the Workers
runtime. Seeding moves into the runtime; the purge job is deleted.

### 4a. Seeding

`src/lib/db/seed.ts` cannot simply be pointed at a different connection string, because it
imports the full `auth` instance and creates users through `auth.api.signUpEmail` so the
password hashes are real. It has to run inside the runtime.

Expose it as a development-only server route, for example `src/routes/api/dev/seed.ts`, with
the handler body guarded by `import.meta.env.DEV`. Vite replaces that with `false` in a
production build, so the seeding code is eliminated from the deployed bundle rather than
merely refused at runtime. Confirm that in the build output before deploying.

`pnpm db:seed` then becomes a request against the dev server:

```bash
curl -X POST http://localhost:3000/api/dev/seed
```

To seed the remote database, seed locally and copy the result up, which keeps the real
hashes and needs no production code path:

```bash
wrangler d1 export mai-tan-db --local --output=seed.sql
wrangler d1 execute mai-tan-db --remote --file=seed.sql
```

### 4b. Purging abandoned registrations — removed

The purge job is **dropped**, not ported. It was a nice-to-have (`docs/dev/maintenance.md`
says nothing breaks if it is missed), and keeping it on D1 would mean a Cron Trigger, which
in turn needs a custom Worker entry re-exporting TanStack Start's fetch handler alongside a
`scheduled` handler. That is the only framework-version-dependent piece in this plan, and it
buys nothing.

Delete `src/lib/db/purge-abandoned.ts`, its `package.json` script, the line in `README.md`,
and `docs/dev/maintenance.md`. Fix the user-facing sentence in
`src/routes/_protected/docs/changelog.tsx` that claims a maintenance job runs.

Removing it orphans `src/features/auth/lib/abandoned-registration.ts` and its test, which
nothing else imports. Delete them too unless the rule is wanted for a future in-app cleanup;
that is a judgement call, not a consequence of the migration.

---

## Step 5 — Other code changes

Your own source imports **no** Node builtins. Everything below comes from dependencies.

### 5a. Better Auth telemetry — nothing to do

An earlier draft proposed `telemetry: { enabled: false }` to keep `@better-auth/telemetry`,
and with it `node:fs`, `node:os` and `node:path`, out of the Workers bundle. **It does not
work, and it is not needed.**

- Telemetry has been opt-in and off by default since Better Auth 1.3.5, so the flag changes
  nothing at runtime.
- `better-auth/dist/index.mjs` imports `@better-auth/telemetry` statically at top level. A
  runtime option cannot remove a module from the graph, so the bundle is identical either way.

`nodejs_compat` supplies those builtins, so the import is harmless. Leave it alone.

### 5b. Password hashing — verify before changing

Better Auth has a known issue where sign-up exceeds the CPU limit on Workers, because hashing
runs `@noble/hashes/scrypt` in pure JavaScript
([better-auth#8860](https://github.com/better-auth/better-auth/issues/8860)). The documented
workaround is a custom hasher using native `node:crypto.scryptSync`, which Workers supports.

**Check this before acting.** The current server bundle already imports `scrypt` from
`node:crypto`, which suggests 1.7.2 may pick the native path when available. Deploy, attempt
a sign-up, and only add a custom `emailAndPassword.password.hash` / `verify` if it is slow or
fails. This is also the cheapest moment to change it: there are no real users, so invalidating
existing hashes costs nothing today and will not be free later.

### 5c. Not in scope

- **R2 / S3.** You are already on Cloudflare R2, so the native R2 binding could replace
  ~4.4 MB of AWS SDK, and on a full-Cloudflare stack that is the obvious next step. But
  `getPresignedUploadImgUrl` depends on presigned URLs, which the binding does not offer
  directly. That is a redesign of the upload flow, not a swap. Keep `@aws-sdk/client-s3` for
  now, but note it is the largest thing evaluated against the 1 s startup budget and the first
  cut if deploy validation fails.
- **Sentry.** `instrument.server.mjs` is loaded only in dev via `NODE_OPTIONS`, and
  `@sentry/*` is not imported anywhere in `src/`. Drop the `NODE_OPTIONS` prefix from the
  `dev` script, since the Vite plugin controls the runtime now. If Sentry is wired up later,
  Workers needs `@sentry/cloudflare`, not the Node SDK.
- **`src/routes/api/health.ts`.** Added for the Netlify warm-up ping and committed in
  `d238480`. Neither Workers nor D1 needs warming, so delete it unless you want a manual
  health check.
- **Tests.** All 11 test files are unit tests under jsdom and none touch the database, so
  `vitest.config.ts` needs no change.
- **CI.** `.github/workflows/ci.yml` only lints, typechecks, tests and builds. Host-agnostic.

---

## Step 6 — Secrets

Move every value out of the Netlify UI. These fall into two categories.

**Runtime secrets.** Run `wrangler secret put <NAME>` for each of `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `RESEND_API_KEY`, `FROM_ADDRESS_EMAIL`, `ADMIN_EMAIL`, and the five `R2_*`
values. `DATABASE_URL` is gone; the database is a binding now.

**Build-time values.** `VITE_APP_URL` is read through `import.meta.env` in
`src/features/organizations/components/create-org.tsx`, which Vite inlines at build time.
`wrangler secret put VITE_APP_URL` does nothing. It has to be present in the environment that
runs `vite build`.

Two points the earlier draft got wrong:

- **`src/lib/env.ts` does not validate all of these.** After dropping `DATABASE_URL` its
  schema covers the five `R2_*`, `RESEND_API_KEY` and `FROM_ADDRESS_EMAIL` — seven of eleven.
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `VITE_APP_URL` and `ADMIN_EMAIL` are read straight
  off `process.env` elsewhere and fail silently at runtime, not loudly at deploy. Add them to
  the schema if you want the loud failure.
- **Sequence the first deploy.** Because `env.ts` parses at module scope, a Worker with
  missing secrets fails startup validation during `wrangler deploy`. Set the secrets first, or
  expect the first deploy to fail.

The `process.env` mechanism is confirmed: with `nodejs_compat_populate_process_env` (default
from compatibility date 2025-04-01), `process.env` is populated lazily the first time
`process` is accessed, so module-scope parsing works.

---

## Step 7 — Deploy and verify

```bash
pnpm db:migrate:remote
pnpm run deploy
```

Then point DNS at the Worker. The domain already sits behind Cloudflare, so this is a routing
change rather than a nameserver change.

Verify in this order. Anonymous paths first, because they are the ones that regressed:

| Check | Expected |
| ----- | -------- |
| `/` | 200, renders the landing page |
| `/login`, `/register`, `/forgot-password` | 200 |
| `/` and `/login` | Served as static assets; no Worker invocation in the analytics |
| `/dashboard`, `/settings`, `/organizations`, `/teams` | 307 to `/login` |
| `/onboarding/*` | 307 to `/login` |
| `/register/password` | 307 to `/register` |
| `/api/dev/seed` | 404 in production |
| Sign-up, then sign-in | Succeeds, and is not slow |
| Organization and team creation | Succeeds; exercises the org plugin on SQLite |
| Several consecutive requests to `/dashboard` | All succeed on a warm isolate |
| CPU p99 in Workers observability, after some traffic | Under 10 ms if staying on Free |
| Cold TTFB after 30 min idle | Under 1 s |

The organization row matters more than usual: the Better Auth organization plugin with teams
is far better travelled on Postgres than on SQLite, and this is the first time this app runs
it there.

The last row is the whole point of the migration. Measure it with
`curl -o /dev/null -w '%{time_starttransfer}'` after leaving the site alone, and compare
against the 5.7 s baseline. Neither the Worker nor D1 has a cold start, so there should be
nothing left to wait for.

---

## Rollback

Netlify stays deployed and serving until DNS moves, so rollback is a DNS change plus reverting
the migration commit. Keep the Netlify site alive for a week before deleting it, and delete
the Netlify database once D1 is confirmed working, which also stops it consuming credits.

The asymmetry worth noting: unlike a Postgres-to-Postgres move, this one changes the schema
dialect, so the Netlify deployment keeps serving the **old** Postgres database. Any data
created on D1 after cutover does not exist there. With no real users that is acceptable, and
it stops being acceptable the moment there are any.

---

## Risks

- **The dev-only seed route.** Step 4a is the part of this plan most likely to sprawl.
  Seeding moves from a script to a route, and a development-only route in a production
  codebase needs the `import.meta.env.DEV` guard verified in the build output, not assumed.
- **Better Auth organization plugin on SQLite.** Supported, but less trodden than Postgres.
  The verification table exercises it deliberately.
- **Free-plan CPU.** 10 ms per invocation, mitigated by prerendering the anonymous routes. If
  `1102` errors appear on the authenticated pages, switch to Paid. One click, not a rollback.
- **Worker startup budget.** 1 s on both plans, with ~4.4 MB of AWS SDK evaluated at startup.
- **D1 write ceiling.** 100,000 rows written per day on Free. Irrelevant at current scale, but
  it is a daily cap rather than a burst cap, so a runaway loop can exhaust it.
- **Lock-in, accepted deliberately.** Leaving Cloudflare later means a dialect migration. The
  schema is small and portable today, which is the best time to have made this choice.
