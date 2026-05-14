# Mai Tan App - B2B SaaS Starter kit

A production-ready, feature-complete starter kit for building multi-tenant B2B SaaS applications. Built with Tanstack Start, Better Auth, Drizzle ORM, and shadcn/ui.

## Features

- **Multi-tenant organizations** - Better Auth organizations plugin with teams, members, roles, and session-persisted context
- **Type-safe forms** - React Hook Form + Zod + TanStack Query mutations

## Tech Stack

### Core

- **Tanstack Start** - Full stack framework
- **React** - Latest React with server components
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework

### Authentication & Database

- **Better Auth** - Modern auth with organizations plugin
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Production database

### UI & Components

- **shadcn/ui** - Radix UI + Tailwind components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Integrations

- **Resend** - Transactional email delivery
- **React Email** - Email starter kit components

### State & Forms

- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mai-tan-app

# Install dependencies
pnpm install

# Set up environment variables (see SETUP.md for details)
cp .env.example .env.local

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For detailed setup instructions including PostgreSQL, Resend, and ImageKit configuration, see [SETUP.md](SETUP.md).

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Public auth pages (login, register, etc.)
│   ├── (protected)/         # Private pages with sidebar layout
│   │   ├── organizations/   # Organization management
│   │   └── settings/        # User settings
│   ├── docs/                # Public documentation
│   └── api/                 # API routes
│
├── features/                # Feature-based modules
│   ├── auth/                # Authentication feature
│   │   ├── components/      # Auth-specific components
│   │   ├── hooks/           # TanStack Query hooks
│   │   ├── lib/             # Auth config and helpers
│   │   ├── emails/          # Email starter kits
│   │   └── validation/      # Zod schemas
│   ├── organizations/       # Organizations feature
│   └── documentation/       # Docs feature with markdown files
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (sidebar, nav, breadcrumbs)
│   └── shared/              # Shared utilities (avatars, forms, etc.)
│
├── lib/
│   └── db/                  # Database config and schema
│
└── hooks/                   # Global custom hooks
```

## Available Scripts

### Development

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
```

### Linting

```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
```

### Database

```bash
pnpm db:generate  # Generate migrations from schema
pnpm db:migrate   # Run pending migrations
pnpm db:push      # Push schema to database (dev only)
```

### UI Components

```bash
npx shadcn@latest add <component>  # Add shadcn/ui component
```

## Contributing

This is a starter kit project designed to be forked and customized. Feel free to:

- Remove features you don't need
- Add your own features following the established patterns
- Customize the design and theming
- Adapt the architecture to your needs

## License

MIT License - feel free to use this starter kit for your projects.

---
