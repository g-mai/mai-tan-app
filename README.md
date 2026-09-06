# Mai Tan App - B2B SaaS Starter Kit - v 0.1.4

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
- **Observability** — Sentry error tracking integrated via `@sentry/tanstackstart-react`
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
- **PostgreSQL** — Production database (local via Docker Compose)

### UI & Components

- **shadcn/ui** — Radix UI + Tailwind components
- **Lucide React** — Icon library
- **Sonner** — Toast notifications

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
- **Docker Compose** — Local PostgreSQL

## Manual installation

From a fresh clone to a running app with demo data in about five minutes.
If you would rather have your AI agent do it for you, scroll down to the
"Installation Prompt".

### Prerequisites

- **Node.js 22.22.2+** (`node -v`)
- **pnpm 11+** (`pnpm -v` — `corepack enable pnpm` if you don't have it)
- **Docker** with the Compose v2 plugin (`docker compose version`), for local PostgreSQL
- Ports **3000** (dev server) and **5432** (PostgreSQL) free

### 1. Clone and install

```bash
git clone https://github.com/g-mai/mai-tan-app
cd mai-tan-app
pnpm install
```

### 2. Configure the environment

```bash
cp .env.example .env && perl -pi -e "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -base64 32)|" .env
```

That copies the defaults and replaces the session-signing secret with a real random one in the same
step. On Linux you can use `sed -i` in place of `perl -pi -e`.

`.env.example` ships with working local defaults — matching PostgreSQL credentials, `localhost:3000`
URLs, and placeholders for the third-party services — so the app boots as soon as it is copied.
Placeholders rather than blanks because `src/lib/env.ts` validates the environment with Zod at
import time and rejects empty `DATABASE_URL`, `RESEND_API_KEY` or `R2_*` values.

The only values left to fill in are **`RESEND_API_KEY`** and the **`R2_*`** group, and they are
needed only by the features that use them (sending email, uploading avatars and logos). Everything
else runs fine on the placeholders.

### 3. Start the database and set up the schema

```bash
docker compose up -d   # start PostgreSQL (pnpm dev does this too)
pnpm db:migrate        # apply the Drizzle migrations — required, tables don't exist yet
pnpm db:seed           # demo users, organizations and teams
```

### 4. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a seeded account:

| Email | Password |
| ----- | -------- |
| `gordon.freeman@blackmesa.com` | `Crowbar123` |
| `lara.croft@tombraider.com` | `DualPistols123` |

Seeded users are email-verified and past onboarding, so they land straight on the dashboard.
Full credentials live in `src/lib/db/seed-data.ts`.

> **Registering a new account needs a real Resend key.** Sign-up is email-first: it sends a 6-digit
> OTP through Resend, and the code is never printed to the console. Without a working key, use the
> seeded accounts above — or set `RESEND_API_KEY` to a real key and `FROM_ADDRESS_EMAIL` to
> `onboarding@resend.dev` (Resend's test sender, which can only deliver to your own address).

### Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| `ZodError` mentioning `R2_*` / `RESEND_API_KEY` on boot | A variable in `.env` was blanked out — `src/lib/env.ts` requires a non-empty value, placeholder or real |
| `relation "user" does not exist` | Migrations never ran — `pnpm db:migrate` |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL isn't up — `docker compose up -d`, then `docker compose ps` |
| Port 5432 already allocated | Another PostgreSQL is running; stop it, or change the host port in `docker-compose.yml` and in `DATABASE_URL` |
| Login says the credentials are wrong | The database was never seeded — `pnpm db:seed` |

Reset everything and start over with `pnpm db:reset` (drops the seeded rows and re-seeds), or
`docker compose down -v` to throw away the volume entirely, then repeat step 3.

### Environment Variables

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Yes | Read by `docker-compose.yml` to provision the local database |
| `DATABASE_URL` | Yes | Must match the three values above |
| `BETTER_AUTH_URL` | Yes | Base URL of the app; also used to build invitation links |
| `BETTER_AUTH_SECRET` | Yes | Signs sessions — `openssl rand -base64 32` |
| `VITE_APP_URL` | Yes | Exposed to the browser bundle; shown as the host affix on organization slugs |
| `RESEND_API_KEY` | Yes (placeholder ok) | Validated as non-empty; must be real to deliver email |
| `FROM_ADDRESS_EMAIL` | Yes (placeholder ok) | Sender address for transactional email |
| `ADMIN_EMAIL` | No | Recipient for admin notification emails |
| `R2_*` | Yes (placeholders ok) | Cloudflare R2 credentials; only exercised by avatar and logo uploads |
| `VITE_SENTRY_*`, `SENTRY_AUTH_TOKEN` | No | Leave empty to disable error reporting |
| `SKIP_VERIFICATION_EMAIL` | No | `true` suppresses verification email sending (used by the seed script) |

## Installation prompt

Prefer to let an agent do it? Paste the prompt below into Claude Code, Codex, or any other coding
agent, from inside the directory where you want the project to live.

```
Set up the mai-tan-app B2B SaaS starter kit for local development on this machine, end to end,
and stop to ask me only if a step genuinely cannot be completed without a decision from me.

1. Check the prerequisites and report their versions: Node.js 22.22.2 or newer, pnpm 11 or newer,
   and Docker with the Compose v2 plugin. If pnpm is missing, run `corepack enable pnpm`. If Node
   is too old or Docker is unavailable, stop and tell me what to install.
2. Confirm ports 3000 and 5432 are free. If either is taken, tell me what is holding it and stop
   rather than killing the process yourself.
3. If the repository is not already in the current directory, clone
   https://github.com/g-mai/mai-tan-app and cd into it. Then run `pnpm install`.
4. Create `.env` from `.env.example`, which already carries working local defaults, and generate a
   real session secret in the same step:
   cp .env.example .env && perl -pi -e "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -base64 32)|" .env
   Leave every other value as it is: the Resend and R2 entries are deliberate placeholders, and
   `src/lib/env.ts` parses the environment with Zod at import time and rejects empty values, so do
   not blank any of them out. Never invent credentials that look real, and never put secrets of
   mine in the file unless I give them to you. Leave `.env` untracked; do not commit it or any
   other file.
5. Start PostgreSQL with `docker compose up -d` and wait until the container reports healthy.
6. Run `pnpm db:migrate` to create the schema, then `pnpm db:seed` to load demo users,
   organizations and teams.
7. Start the dev server with `pnpm dev` in the background, wait for it to be ready, and verify that
   http://localhost:3000 responds and that the server log shows no environment or database errors.
8. Verify the toolchain is healthy: `pnpm check` (Biome) and `pnpm test` (Vitest) should pass.
9. Report back: the versions you found, the file you created, the URL to open, and the seeded login
   credentials taken from `src/lib/db/seed-data.ts` (for example gordon.freeman@blackmesa.com with
   password Crowbar123). Mention that registering a brand-new account requires a real Resend API
   key, because sign-up sends a 6-digit OTP by email and the code is never logged, so I should sign
   in with a seeded account until I add one.

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
│   └── api/auth/$.ts          # Better Auth catch-all API handler
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
│   ├── db/                    # Drizzle config, schema, seed
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
pnpm dev          # Start dev server (also starts Docker postgres via docker compose up -d)
pnpm build        # Production build
pnpm preview      # Preview the production build locally
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
pnpm db:migrate        # Run pending migrations
pnpm db:push           # Push schema directly to DB (dev only)
pnpm db:seed           # Seed the database
pnpm db:reset          # Reset and re-seed the database
pnpm db:purge-abandoned # Delete abandoned registrations (see docs/dev/maintenance.md)
pnpm db:studio         # Open Drizzle Studio
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

## Contributing

This is a starter kit designed to be forked and customized:

- Remove features you don't need
- Add your own features following the established patterns
- Customize the design and theming
- Adapt the architecture to your needs

## License

MIT License — free to use for your projects.
