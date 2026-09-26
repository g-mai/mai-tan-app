import { Link } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  GitBranch,
  LayoutDashboard,
  Lock,
  Mail,
  Package,
  Plus,
  Server,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";

export function HomeHero() {
  return (
    <section
      id="overview"
      aria-labelledby="home-title"
      className="scroll-mt-15 border-b"
    >
      <div className="mx-auto grid max-w-300 grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:py-24">
        <div>
          <Badge variant="secondary" className="font-mono">
            <Package data-icon="inline-start" aria-hidden="true" />
            B2B SaaS starter kit
          </Badge>
          <h1
            id="home-title"
            className="mt-5 max-w-145 font-bold text-4xl leading-[1.02] tracking-tight sm:text-5xl lg:text-[56px]"
          >
            Ship the product,
            <br />
            <span className="text-primary">not the plumbing.</span>
          </h1>
          <p className="mt-6 max-w-[60ch] text-base text-muted-foreground leading-relaxed">
            Mai Tan App is a working foundation for multi-tenant B2B SaaS.
            Authentication, organizations, teams, onboarding, and email flows
            are already in place, so you can start on the part that is yours.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link to="/register">
                <UserPlus data-icon="inline-start" aria-hidden="true" />
                Get started
              </Link>
            </Button>
            <a
              href="https://github.com/g-mai/mai-tan-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <GitBranch aria-hidden="true" className="size-4" />
              View the source
            </a>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <Zap
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-secondary"
            />
            Email verification and a guided setup get the first workspace
            moving.
          </p>
        </div>

        <div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted px-3.5 py-2.75">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-secondary"
              />
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-secondary/50"
              />
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-primary"
              />
              <span className="ml-2 hidden min-w-0 items-center gap-1.5 truncate font-mono text-xs text-muted-foreground sm:flex">
                <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                tan.g-mai.dev/acme-inc
              </span>
            </div>
            <div className="grid min-h-70 grid-cols-1 sm:grid-cols-[132px_minmax(0,1fr)]">
              <div className="hidden flex-col gap-1 border-r bg-muted/50 p-2.5 sm:flex">
                <div className="mb-2 flex min-w-0 items-center gap-2 rounded-lg border bg-card p-1.5">
                  <span className="flex size-5.5 shrink-0 items-center justify-center rounded-md bg-primary font-mono font-bold text-xs text-primary-foreground">
                    A
                  </span>
                  <span className="truncate font-semibold text-xs">
                    Acme Inc
                  </span>
                  <ChevronsUpDown
                    aria-hidden="true"
                    className="ml-auto size-3.5 shrink-0 text-muted-foreground"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-md bg-primary/12 px-2 py-1.5 font-semibold text-xs text-primary">
                  <LayoutDashboard aria-hidden="true" className="size-3.5" />
                  Dashboard
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
                  <Users aria-hidden="true" className="size-3.5" />
                  Members
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
                  <Settings2 aria-hidden="true" className="size-3.5" />
                  Settings
                </div>
              </div>
              <div className="min-w-0 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">Members</span>
                  <Badge variant="default" className="font-mono">
                    <Plus data-icon="inline-start" aria-hidden="true" />
                    Invite
                  </Badge>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex min-w-0 items-center gap-2.5 rounded-lg border bg-card p-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 font-mono font-bold text-xs text-primary">
                      JD
                    </span>
                    <div className="min-w-0 leading-tight">
                      <div className="truncate font-semibold text-sm">
                        Jamie Dover
                      </div>
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        jamie@acme.co
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-auto font-mono text-xs"
                    >
                      owner
                    </Badge>
                  </div>
                  <div className="hidden min-w-0 items-center gap-2.5 rounded-lg border bg-card p-2.5 sm:flex">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono font-bold text-xs text-muted-foreground">
                      RS
                    </span>
                    <div className="min-w-0 leading-tight">
                      <div className="truncate font-semibold text-sm">
                        Riley Sun
                      </div>
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        riley@acme.co
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto font-mono text-xs"
                    >
                      admin
                    </Badge>
                  </div>
                  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-dashed p-2.5 font-mono text-xs text-muted-foreground">
                    <Mail aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">
                      taylor@acme.co — invite pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-3.5 text-primary"
                />
                scoped org context
              </span>
              <span className="flex items-center gap-1.5">
                <Server aria-hidden="true" className="size-3.5 text-primary" />
                typed server flows
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
