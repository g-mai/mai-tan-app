# Mai Tan App - B2B SaaS Starter Kit - v 0.1.1

A production-ready, feature-complete starter kit for building multi-tenant B2B SaaS applications. Built with TanStack Start, Better Auth, Drizzle ORM, and shadcn/ui.

Demo: [CLICK HERE](https://tan.g-mai.dev/) to check it live!

## Features

- **Multi-tenant organizations** — Better Auth organizations plugin with teams, members, roles, and session-persisted context
- **Organization & team management** — Create and edit organizations and teams from dedicated routes
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
- **Vitest** — Unit testing - WIP
- **Docker Compose** — Local PostgreSQL

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 11+
- Docker (for local PostgreSQL via Docker Compose)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mai-tan-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start dev server (also starts Docker postgres automatically)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

For variables in `.env`, check .env.example

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx             # Root shell, loads session, sets theme
│   ├── _auth/                 # Public auth pages (login, register, forgot/reset password)
│   ├── _protected/            # Authenticated pages with sidebar layout
│   │   ├── organizations/     # Organization list, detail, creation
│   │   ├── teams/             # Team list, detail, creation
│   │   └── settings.tsx       # User settings
│   ├── demo/                  # Demo/testing routes (Sentry, TanStack Query)
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
pnpm start        # Start production server
pnpm preview      # Preview production build locally
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
