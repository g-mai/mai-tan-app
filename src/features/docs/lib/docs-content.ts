export const FEATURES = [
  {
    title: "Multi-tenant organizations",
    description:
      "Better Auth organizations plugin with teams, members, roles, and session-persisted context.",
  },
  {
    title: "Type-safe forms",
    description: "@tanstack/react-form + Zod + TanStack Query mutations.",
  },
  {
    title: "Full-stack SSR",
    description:
      "Server-side rendering with TanStack Start, dehydrated/rehydrated query cache.",
  },
  {
    title: "Email flows",
    description:
      "Transactional email via Resend (verification, password reset).",
  },
  {
    title: "Observability-ready",
    description:
      "Sentry dependency and configuration scaffolding; integration is pending.",
  },
  {
    title: "Theme toggle",
    description: "Light/dark mode with init script, no flash on load.",
  },
  {
    title: "Deployed on Cloudflare",
    description:
      "Workers runtime with D1 as the database and R2 for uploads, configured in wrangler.jsonc.",
  },
] as const;

export const PREREQUISITES = ["Node.js 22.22.2+", "pnpm 11+", "Port 3000 free"];

export const INSTALL_STEPS = `# Clone the repository
git clone <your-repo-url>
cd mai-tan-app

# Install dependencies
pnpm install

# Set up environment variables — .env for tooling, .dev.vars for the Worker
cp .env.example .env
cp .dev.vars.example .dev.vars

# Create the local D1 database
pnpm db:migrate:local

# Start dev server (Vite + Miniflare)
pnpm dev`;
