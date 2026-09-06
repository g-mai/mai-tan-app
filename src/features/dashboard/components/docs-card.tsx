import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Database,
  ShieldCheck,
} from "lucide-react";

const docs = [
  {
    title: "TanStack Start",
    description: "routing, SSR, server functions",
    href: "/stack/tanstack-start",
    icon: Bot,
  },
  {
    title: "Better Auth",
    description: "sessions, orgs, invitations",
    href: "/stack/better-auth",
    icon: ShieldCheck,
  },
  {
    title: "Drizzle ORM",
    description: "schema, migrations, seeding",
    href: "/stack/drizzle-orm",
    icon: Database,
  },
  {
    title: "Get started",
    description: "prerequisites and install",
    href: "/docs/get-started",
    icon: BookOpen,
  },
] as const;

export function DocsCard() {
  return (
    <div className="rounded-xl border bg-card px-6 py-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-semibold">Docs and tech stack</p>
        <span className="font-mono text-2xs text-muted-foreground">
          what this app is built on
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {docs.map((doc) => (
          <Link
            key={doc.title}
            to={doc.href}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              <doc.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{doc.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {doc.description}
              </span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
