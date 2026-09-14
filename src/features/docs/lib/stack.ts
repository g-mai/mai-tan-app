import { Database, Rocket, ShieldCheck } from "lucide-react";

export const HIGHLIGHTS = [
  {
    title: "TanStack Start",
    description: "Full-stack SSR framework, built on TanStack Router.",
    href: "/stack/tanstack-start",
    icon: Rocket,
  },
  {
    title: "Better Auth",
    description: "Comprehensive authentication framework for TypeScript.",
    href: "/stack/better-auth",
    icon: ShieldCheck,
  },
  {
    title: "Drizzle ORM",
    description: "Lightweight, type-safe SQL toolkit for TypeScript.",
    href: "/stack/drizzle-orm",
    icon: Database,
  },
] as const;

export const REST_OF_STACK = [
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "PostgreSQL",
  "shadcn/ui",
  "TanStack Query",
  "Resend",
  "Sentry",
  "Biome",
] as const;

/** The props each /stack detail route hands to `TechStackPage`. */
export const STACK_DETAILS = {
  tanstackStart: {
    name: "TanStack Start",
    tagline: "Full-stack SSR framework, built on TanStack Router",
    icon: Rocket,
    overview:
      "TanStack Start is a full-stack framework built on TanStack Router that adds server-side capabilities to router-first applications. Its core features include server-side rendering (SSR), streaming responses, and server functions with validated boundaries, with deployable output for runtimes like Vercel, Netlify, and Cloudflare.",
    text: "This app uses TanStack Start end-to-end — file-based routing, server functions (createServerFn) for auth and data access, and SSR with a dehydrated/rehydrated TanStack Query cache across the server/client boundary.",
    link: "https://tanstack.com/start/latest",
  },
  betterAuth: {
    name: "Better Auth",
    tagline: "Comprehensive authentication framework for TypeScript",
    icon: ShieldCheck,
    overview:
      "Better Auth bills itself as the most comprehensive authentication framework for TypeScript, supporting Next.js, TanStack Start, Nuxt, SvelteKit, and 20+ other frameworks. It includes built-in credential authentication, social sign-on providers, multi-tenancy with teams and roles, passkeys, magic links, and enterprise features like SSO and SAML.",
    text: "Handles authentication in this starter via the Drizzle adapter. The organizations plugin provides the multi-tenant model — organizations, teams, members, and roles — with sessions threaded through router context via a server-side getSession function.",
    link: "https://www.better-auth.com",
  },
  drizzleOrm: {
    name: "Drizzle ORM",
    tagline: "Lightweight, type-safe SQL toolkit for TypeScript",
    icon: Database,
    overview:
      "Drizzle ORM describes itself as a headless TypeScript ORM with a head — it functions more like a type-safe SQL query builder than a traditional ORM, with strong performance and support for PostgreSQL, MySQL, SQLite, and more. It ships with an intuitive schema declaration system, relational queries, and migration tooling via Drizzle Kit.",
    text: "Every schema, migration, and query in src/lib/db runs through Drizzle against PostgreSQL, including the auto-generated Better Auth schema in auth-schema.ts.",
    link: "https://orm.drizzle.team",
  },
} as const;
