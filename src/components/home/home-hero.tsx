import { Link } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  CreditCard,
  GitBranch,
  LayoutDashboard,
  Lock,
  LogIn,
  Mail,
  Package,
  Plus,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { DemoButton } from "#/features/demo/components/demo-button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        className="pointer-events-none absolute inset-0 opacity-28"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(120% 100% at 70% 0%, #000 30%, transparent 75%)",
        }}
      />
      <div className="relative mx-auto grid max-w-300 grid-cols-1 items-center gap-10 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-22">
        {/* left column */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 font-mono font-medium text-secondary text-xs"
          >
            <Package className="size-3.5" /> B2B SaaS starter kit
          </Badge>
          <h1 className="mt-5.5 font-bold text-4xl leading-[1.02] tracking-tight sm:text-5xl lg:text-[56px]">
            Ship the product,
            <br />
            <span className="text-primary">not the plumbing.</span>
          </h1>
          <p className="mt-5.5 max-w-130 text-base text-muted-foreground leading-relaxed">
            Mai Tan App is a production-ready starter kit for multi-tenant B2B
            SaaS. Auth, organizations, teams, and billing already wired — so you
            start on the part that's actually yours.
          </p>

          <div className="mt-6">
            <DemoButton
              size="lg"
              className="gap-2 transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Terminal /> Explore the demo
            </DemoButton>
            <p className="mt-3.5 flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
              <Zap className="size-3.5 text-secondary" /> A demo account is
              created for you — no signup, no setup.
            </p>
            <div className="mt-5.5 flex flex-wrap items-center gap-3 border-t pt-5.5">
              <span className="font-mono text-muted-foreground text-xs">
                Prefer your own account?
              </span>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 transition-transform duration-150 hover:-translate-y-0.5"
                asChild
              >
                <Link to="/register">
                  <UserPlus /> Create account
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="gap-2" asChild>
                <Link to="/login">
                  <LogIn /> Login
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* app preview mock */}
        <div className="animate-in fade-in slide-in-from-bottom-2 delay-100 duration-300">
          <div className="overflow-hidden rounded-xl border bg-card shadow-[6px_6px_0_0_rgba(0,0,0,0.12),6px_4px_10px_-3px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-2 border-b bg-muted/60 px-3.5 py-2.75">
              <span className="size-2.75 rounded-full bg-secondary/85" />
              <span className="size-2.75 rounded-full bg-secondary/40" />
              <span className="size-2.75 rounded-full bg-primary/85" />
              <span className="ml-2 flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
                <Lock className="size-3" /> tan.g-mai.dev/acme-inc
              </span>
            </div>
            <div className="grid min-h-70 grid-cols-[150px_1fr]">
              <div className="flex flex-col gap-1 border-r bg-muted/35 p-2.5">
                <div className="mb-2 flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-[1px_1px_0_0_rgba(0,0,0,0.06)]">
                  <span className="flex size-5.5 items-center justify-center rounded-md bg-primary font-mono font-bold text-[11px] text-primary-foreground">
                    A
                  </span>
                  <span className="font-mono font-semibold text-xs">
                    Acme Inc
                  </span>
                  <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 rounded-md bg-primary/12 px-2 py-1.5 font-semibold text-[12.5px] text-primary">
                  <LayoutDashboard className="size-3.75" /> Dashboard
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-muted-foreground">
                  <Users className="size-3.75" /> Members
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-muted-foreground">
                  <CreditCard className="size-3.75" /> Billing
                </div>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-muted-foreground">
                  <Settings2 className="size-3.75" /> Settings
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">Members</span>
                  <span className="flex items-center gap-1 rounded-full bg-primary px-2.25 py-0.75 font-mono text-[11px] text-primary-foreground shadow-[1px_1px_0_0_rgba(0,0,0,0.14)]">
                    <Plus className="size-3" /> Invite
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2.25 shadow-[1px_1px_0_0_rgba(0,0,0,0.06)]">
                    <span className="flex size-6.5 items-center justify-center rounded-full bg-primary/22 font-mono font-bold text-[11px] text-primary">
                      JD
                    </span>
                    <div className="leading-tight">
                      <div className="font-semibold text-[12.5px]">
                        Jamie Dover
                      </div>
                      <div className="font-mono text-[10.5px] text-muted-foreground">
                        jamie@acme.co
                      </div>
                    </div>
                    <span className="ml-auto rounded-full border border-secondary/35 bg-secondary/16 px-2 py-0.5 font-mono text-[10.5px] text-secondary">
                      owner
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2.25 shadow-[1px_1px_0_0_rgba(0,0,0,0.06)]">
                    <span className="flex size-6.5 items-center justify-center rounded-full bg-muted-foreground/24 font-mono font-bold text-[11px]">
                      RS
                    </span>
                    <div className="leading-tight">
                      <div className="font-semibold text-[12.5px]">
                        Riley Sun
                      </div>
                      <div className="font-mono text-[10.5px] text-muted-foreground">
                        riley@acme.co
                      </div>
                    </div>
                    <span className="ml-auto rounded-full border bg-muted px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                      admin
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-dashed p-2.25 font-mono text-[11px] text-muted-foreground">
                    <Mail className="size-3.5" /> taylor@acme.co — invite
                    pending
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2.5 font-mono text-muted-foreground text-xs justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" /> row-level
                tenancy
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="size-3.5 text-primary" /> SSR + typed loaders
              </span>
            </div>
            <Button
              variant="link"
              size="lg"
              // className="gap-2 transition-transform duration-150 hover:-translate-y-0.5"
              asChild
            >
              <a
                href="https://github.com/g-mai/mai-tan-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <GitBranch className="size-3.5" /> GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
