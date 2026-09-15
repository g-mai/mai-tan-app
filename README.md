# Mai Tan App - B2B SaaS Starter Kit - v 0.1.5

A production-ready, feature-complete starter kit for building multi-tenant B2B SaaS applications. Built with TanStack Start, Better Auth, Drizzle ORM, and shadcn/ui.

Demo: [CLICK HERE](https://tan.g-mai.dev/) to check it live!

## Features

- **Multi-tenant organizations** — Better Auth organizations plugin with teams, members, roles, and session-persisted context
- **Organization & team management** — Create and edit organizations and teams from dedicated routes
- **Guided onboarding** — Email OTP registration followed by a mandatory, resumable seven-step onboarding flow (password, profile, org, plan, team, invite, done)
- **Collapsible sidebar** — Nested navigation with persisted open/closed state
- **Type-safe forms** — `@tanstack/react-form` + Zod + TanStack Query mutations
- **Full-stack SSR** — Server-side rendering with TanStack Start, dehydrated/rehydrated query cache
- **Email flows** — Transactional email via Resend (verification, password reset)
- **Observability-ready** — Sentry dependency and configuration scaffolding (integration pending)
- **Theme toggle** — Light/dark mode with init script, no flash on load

## Tech Stack

### Core

- **TanStack Start** — Full-stack SSR React framework
- **React 19** — Latest React
- **TypeScript** — Static typing
- **Tailwind CSS v4** — Utility-first CSS

### Authentication & Database

- **Better Auth** — Modern auth with organizations plugin
- **Drizzle ORM** — Type-safe database toolkit
- **Cloudflare D1** — SQLite database, bound to the Worker (local via Miniflare)

### UI & Components

- **shadcn/ui** — Radix UI + Tailwind components
- **Lucide React** — Icon library
- **Sonner** — Toast notifications

### Hosting

- **Cloudflare Workers** — Runtime and deployment target, via Wrangler
- **Cloudflare R2** — Object storage for avatars and logos

### Integrations

- **Resend** — Transactional email delivery
- **React Email** — Email template components
- **Sentry** — Error monitoring and observability WIP

### State & Forms

- **TanStack Query** — Server state management
- **@tanstack/react-form** — Form handling
- **Zod** — Schema validation

### Tooling

- **Biome** — Linter and formatter (replaces ESLint + Prettier)
- **Vitest** — Unit testing
- **Wrangler** — Cloudflare CLI: local D1, migrations, deploys

## Manual installation

From a fresh clone to a running app in about five minutes.
If you would rather have your AI agent do it for you, scroll down to the
"Installation Prompt".

### Prerequisites

- **Node.js 22.22.2+** (`node -v`)
- **pnpm 11+** (`pnpm -v` — `corepack enable pnpm` if you don't have it)
- Port **3000** free (dev server)

No database server to install: D1 runs locally inside Miniflare, which the Cloudflare Vite plugin
starts as part of `pnpm dev`. A Cloudflare account is needed only to deploy.

### 1. Clone and install

```bash
git clone https://github.com/g-mai/mai-tan-app
cd mai-tan-app
pnpm install
```

### 2. Configure the environment

There are two environment files, because two different runtimes read them:

| File | Read by | Holds |
| ---- | ------- | ----- |
| `.env` | Node — Drizzle Kit and the Vite build | `CLOUDFLARE_*` for remote D1, `VITE_*`, Sentry build settings |
| `.dev.vars` | The Worker, via Wrangler | Local Worker configuration and secrets |

```bash
cp .env.example .env
cp .dev.vars.example .dev.vars && perl -pi -e "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -base64 32)|" .dev.vars
```

That copies both templates and replaces the session-signing secret with a real random one in the
same step. On Linux you can use `sed -i` in place of `perl -pi -e`.

Both templates ship with the core local defaults needed to boot. Resend and R2 are optional and may
stay blank until email delivery or image uploads are used. The `CLOUDFLARE_*` entries in `.env` may
also stay empty until you talk to the remote database.

Validation lives in three [T3 Env](https://env.t3.gg) modules: `src/lib/env.tooling.ts` for Node tooling,
`src/lib/env.server.ts` for the Worker, and `src/lib/env.public.ts` for browser-exposed `VITE_*`
values. Importing the server module from client code fails the build, so a secret cannot reach the
bundle by accident.

One consequence for CI: `pnpm build` prerenders pages by running the Worker, which reads `.dev.vars`.
A fresh checkout has no such file, so a pipeline has to create one — `cp .dev.vars.example .dev.vars`
before the build is enough because prerendering does not call Resend or R2.

### 3. Create the local database

```bash
pnpm db:migrate:local   # apply the Drizzle migrations to local D1 — required, tables don't exist yet
```

Migrations are applied by Wrangler from `src/lib/db/drizzle`, the `migrations_dir` declared in
`wrangler.jsonc`.

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account.

> **Registering needs a real Resend key.** Sign-up is email-first: it sends a 6-digit OTP through
> Resend, and the code is never printed to the console. Set `RESEND_API_KEY` in `.dev.vars` to a
> real key and `FROM_ADDRESS_EMAIL` to `onboarding@resend.dev` (Resend's test sender, which can
> only deliver to your own address), then restart the dev server.

### Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| `Email is not configured` | Set `RESEND_API_KEY` before using registration or another email flow |
| `Image storage is not configured` | Set all five `R2_*` values before uploading an avatar or logo |
| `no such table: user` | Migrations never ran — `pnpm db:migrate:local` |
| Changes to `.dev.vars` seem ignored | Wrangler reads it at startup only; restart `pnpm dev` |
| `drizzle-kit` errors about account or token | The `CLOUDFLARE_*` values in `.env` are empty; they are needed only for remote D1 |
| Port 3000 already allocated | Another process holds it; stop it, or change the port in the `dev` script |

To start over with an empty database, delete the local D1 state and re-migrate:

```bash
rm -rf .wrangler/state/v3/d1
pnpm db:migrate:local
```

### Environment Variables

**`.env`** — Node-side, build and tooling:

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` | Only for remote D1 | Used by `drizzle.config.ts` for `pnpm db:studio` and any `drizzle-kit` command that hits the deployed database |
| `VITE_APP_URL` | No | Exposed to the browser bundle; shown as the host affix on organization slugs |
| `VITE_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | No | Reserved for the planned Sentry integration; currently unused |

**`.dev.vars`** — Worker runtime. In production, non-sensitive values belong in
`wrangler.jsonc` and credentials are Worker secrets (`wrangler secret put <NAME>`), not a file:

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `BETTER_AUTH_URL` | Yes | Base URL of the app; also used to build invitation links |
| `BETTER_AUTH_SECRET` | Yes | Signs sessions — `openssl rand -base64 32` |
| `RESEND_API_KEY` | Only for email flows | Must be real to deliver email, and therefore to register |
| `FROM_ADDRESS_EMAIL` | Only for email flows | Sender address used with `RESEND_API_KEY` |
| `ADMIN_EMAIL` | No | Recipient for admin notification emails |
| `R2_*` | Only for image uploads | All five values are required together for avatar and logo uploads |
| `SKIP_VERIFICATION_EMAIL` | No | `true` suppresses verification and invitation email sending |

The database is not an environment variable. D1 arrives as the `DB` binding declared in
`wrangler.jsonc`, which `src/lib/db/index.ts` reads from `cloudflare:workers`.

### Deploying

```bash
pnpm db:migrate:remote   # apply migrations to the deployed D1 database
pnpm deploy              # vite build && wrangler deploy
```

Migrations are a deliberate, separate step — they are not part of the build. Set required
credentials as Worker secrets before the first deploy:

```bash
wrangler secret put BETTER_AUTH_SECRET
```

## Installation prompt

Prefer to let an agent do it? Paste the prompt below into Claude Code, Codex, or any other coding
agent, from inside the directory where you want the project to live.

```
Set up the mai-tan-app B2B SaaS starter kit for local development on this machine, end to end,
and stop to ask me only if a step genuinely cannot be completed without a decision from me.

1. Check the prerequisites and report their versions: Node.js 22.22.2 or newer and pnpm 11 or
   newer. If pnpm is missing, run `corepack enable pnpm`. If Node is too old, stop and tell me
   what to install. There is no database server to set up: D1 runs locally inside Miniflare,
   which `pnpm dev` starts for you.
2. Confirm port 3000 is free. If it is taken, tell me what is holding it and stop rather than
   killing the process yourself.
3. If the repository is not already in the current directory, clone
   https://github.com/g-mai/mai-tan-app and cd into it. Then run `pnpm install`.
4. Create the two environment files from their templates, generating a real session secret in the
   same step:
   cp .env.example .env
   cp .dev.vars.example .dev.vars && perl -pi -e "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -base64 32)|" .dev.vars
   Leave the optional Resend, R2, Cloudflare, and Sentry entries blank until those integrations are
   used. Never invent credentials that look real, and never put secrets of
   mine in the file unless I give them to you. Leave `.env` and `.dev.vars` untracked; do not
   commit them or any other file.
5. Run `pnpm db:migrate:local` to create the schema in the local D1 database.
6. Start the dev server with `pnpm dev` in the background, wait for it to be ready, and verify that
   http://localhost:3000 responds and that the server log shows no environment or database errors.
7. Verify the toolchain is healthy: `pnpm check` (Biome) and `pnpm test` (Vitest) should pass.
8. Report back: the versions you found, the files you created, and the URL to open. Tell me that
   registering an account requires a real Resend API key, because sign-up sends a 6-digit OTP by
   email and the code is never logged, so I should put a real key in `RESEND_API_KEY` and set
   `FROM_ADDRESS_EMAIL` to onboarding@resend.dev before trying to sign up.

If a command fails, show me the actual error output and your diagnosis before trying a fix, and do
not modify application source files to work around setup problems.
```

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx             # Root shell, loads session, sets theme
│   ├── _auth/                 # Public auth pages (login, forgot/reset password, register/)
│   │   └── register/          # Email → verify OTP → set password
│   ├── _protected/            # Authenticated pages with sidebar layout
│   │   ├── organizations/     # Organization list, detail, creation
│   │   ├── teams/             # Team list, detail, creation
│   │   └── settings/          # User settings, billing
│   ├── onboarding/            # Mandatory, resumable onboarding flow
│   ├── invite/                # Invitation acceptance
│   └── api/
│       ├── auth/$.ts          # Better Auth catch-all API handler
│       └── health.ts          # Liveness probe
│
├── features/                  # Feature-based modules
│   ├── auth/                  # Authentication
│   │   ├── components/        # Auth-specific UI components
│   │   ├── hooks/             # TanStack Query mutation hooks
│   │   ├── lib/               # auth.ts (server) and auth-client.ts (client)
│   │   ├── emails/            # React Email templates
│   │   └── validation/        # Zod schemas
│   ├── organizations/         # Organizations and teams
│   └── layout/                # Sidebar, nav, layout components
│
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── shared/                # Shared components (form fields, page titles, etc.)
│
├── lib/
│   ├── db/                    # Drizzle schema and generated migrations
│   ├── query/                 # TanStack Query configs
│   ├── resend/                # Resend client and email helpers
│   ├── storage/               # R2 storage config and functions
│   └── utils.ts               # cn() utility
│
└── hooks/                     # Global custom hooks (useAppForm)
```

## Available Scripts

### Development

```bash
pnpm dev          # Start dev server (Vite + Miniflare, with local D1)
pnpm build        # Production build
pnpm preview      # Preview the production build locally
pnpm deploy       # Build and deploy to Cloudflare Workers
pnpm typecheck    # Type-check with tsc --noEmit
```

### Linting & Formatting

```bash
pnpm check        # Run Biome lint + format check (preferred before committing)
pnpm lint         # Run Biome linter only
pnpm format       # Run Biome formatter only
```

### Testing

```bash
pnpm test         # Run all tests with Vitest
```

### Database

```bash
pnpm db:generate       # Generate Drizzle migrations from schema
pnpm db:migrate:local  # Apply migrations to the local D1 database
pnpm db:migrate:remote # Apply migrations to the deployed D1 database
pnpm db:studio         # Open Drizzle Studio against remote D1
pnpm db:studio:local   # Open Drizzle Studio against the local D1 SQLite file
pnpm db:auth-generate  # Regenerate Better Auth schema
```

### UI Components

```bash
npx shadcn@latest add <component>  # Add a shadcn/ui component
```

## Architecture Notes

- **Import alias**: `#/*` maps to `./src/*` — use `#/` for all internal imports.
- **Route tree**: Auto-generated into `src/routeTree.gen.ts` — never edit manually.
- **Auth client**: Import `signIn`, `signOut`, `useSession`, `organization`, etc. from `src/features/auth/lib/auth-client.ts`.
- **Forms**: Use `useAppForm` from `src/hooks/use-app-form.ts` instead of raw `useForm`.
- **Database binding**: D1 is the `DB` binding in `wrangler.jsonc`; `src/lib/db/index.ts` reads it
  from `cloudflare:workers`. There is no connection string.
- **Migrations**: generated by Drizzle Kit into `src/lib/db/drizzle`, applied by Wrangler. Never
  part of the build.

## Contributing

This is a starter kit designed to be forked and customized:

- Remove features you don't need
- Add your own features following the established patterns
- Customize the design and theming
- Adapt the architecture to your needs

## License

MIT License — free to use for your projects.
