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
    title: "Observability",
    description:
      "Sentry error tracking integrated via @sentry/tanstackstart-react.",
  },
  {
    title: "Theme toggle",
    description: "Light/dark mode with init script, no flash on load.",
  },
] as const;

export const PREREQUISITES = [
  "Node.js 18+",
  "pnpm 11+",
  "Docker (for local PostgreSQL)",
];

export const INSTALL_STEPS = `# Clone the repository
git clone <your-repo-url>
cd mai-tan-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start dev server (also starts Docker postgres automatically)
pnpm dev`;
