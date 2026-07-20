import {
  Activity,
  Building2,
  FileCheck,
  type LucideIcon,
  Mail,
  Palette,
  Server,
} from "lucide-react";
import { IconCard } from "#/components/home/icon-card";

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Type-safe forms",
    description:
      "@tanstack/react-form + Zod, validated end to end with Query mutations.",
    icon: FileCheck,
  },
  {
    title: "Full-stack SSR",
    description:
      "Server rendering with TanStack Start and a dehydrated/rehydrated query cache.",
    icon: Server,
  },
  {
    title: "Email flows",
    description:
      "Transactional email via Resend — verification and password reset out of the box.",
    icon: Mail,
  },
  {
    title: "Observability",
    description:
      "Sentry error tracking wired through @sentry/tanstackstart-react.",
    icon: Activity,
  },
  {
    title: "Theme toggle",
    description:
      "Light/dark mode with an init script — no flash of the wrong theme on load.",
    icon: Palette,
  },
];

export function HomeFeatures() {
  return (
    <section id="features" className="scroll-mt-15 border-b bg-muted">
      <div className="mx-auto max-w-300 px-6 py-16 lg:py-22">
        <div className="max-w-160">
          <div className="font-medium font-mono text-secondary text-xs">
            {"// everything you need on day one"}
          </div>
          <h2 className="mt-3.5 font-bold text-3xl leading-[1.1] tracking-tight sm:text-[34px]">
            The building blocks, already wired together.
          </h2>
          <p className="mt-3.5 text-[15px] text-muted-foreground leading-relaxed">
            No half-finished screens, no dead links. Every block ships as a
            working end-to-end flow you can learn from and build on.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.12),4px_3px_6px_-2px_rgba(0,0,0,0.1)] sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-[2px_2px_0_0_rgba(0,0,0,0.14)]">
                <Building2 className="size-5" />
              </div>
              <div className="font-semibold text-[17px]">
                Multi-tenant organizations
              </div>
            </div>
            <p className="mt-3.5 max-w-110 text-[14px] text-muted-foreground leading-relaxed">
              Better Auth organizations plugin with teams, members, roles, and
              session-persisted context. Every query is scoped to the active
              org, enforced at the row level.
            </p>
            <div className="mt-4.5 flex flex-wrap gap-2 font-mono text-xs">
              {["teams", "roles", "invitations", "/{org.slug}"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2.25 py-0.75 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {features.map((feature) => (
            <IconCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
