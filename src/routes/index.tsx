import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { LogoTitle } from "#/components/shared/logo-title";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import Footer from "#/features/layout/components/footer";
import ThemeToggle from "#/features/layout/components/theme-toggle";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const features = [
  {
    title: "Multi-tenant organizations",
    description:
      "Better Auth organizations plugin with teams, members, roles, and session-persisted context.",
    icon: Building2,
  },
  {
    title: "Type-safe forms",
    description: "@tanstack/react-form + Zod + TanStack Query mutations.",
    icon: ShieldCheck,
  },
  {
    title: "Full-stack SSR",
    description:
      "Server-side rendering with TanStack Start, dehydrated/rehydrated query cache.",
    icon: Zap,
  },
  {
    title: "Email flows",
    description:
      "Transactional email via Resend (verification, password reset).",
    icon: Mail,
  },
  {
    title: "Observability",
    description:
      "Sentry error tracking integrated via @sentry/tanstackstart-react.",
    icon: Sparkles,
  },
  {
    title: "Theme toggle",
    description: "Light/dark mode with init script, no flash on load.",
    icon: Palette,
  },
] as const;

const techStack = [
  "TanStack Start",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "Better Auth",
  "Drizzle ORM",
  "PostgreSQL",
  "shadcn/ui",
  "TanStack Query",
  "Resend",
  "Sentry",
  "Biome",
] as const;

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-8">
        <LogoTitle href="/" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-8 sm:py-24">
          <Badge variant="secondary" className="mb-4">
            B2B SaaS Starter Kit
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Mai Tan App
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A production-ready starter kit for building multi-tenant B2B SaaS
            applications. Authentication, organizations, teams, and billing
            infrastructure — already working, so you can focus on your product.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/register">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Tech stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
