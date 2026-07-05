import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, Rocket, ShieldCheck } from "lucide-react";
import { PageTitle } from "#/components/shared/page-title";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/stack/")({
  component: RouteComponent,
});

const highlights = [
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

const restOfStack = [
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

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Tech stack"
        subtitle="The tools and frameworks this starter kit is built on."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(({ title, description, href, icon: Icon }) => (
          <Link to={href} key={title}>
            <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
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
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Also in the stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {restOfStack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
