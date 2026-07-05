import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/about")({
  component: About,
});

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

function About() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="About Mai Tan App"
        subtitle="A production-ready starter kit for multi-tenant B2B SaaS applications."
      />

      <Card>
        <CardHeader>
          <CardTitle>What this is</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mai Tan App is a starter kit for teams building a B2B SaaS product.
            Authentication, multi-tenant organizations, teams, and session
            management already work end-to-end, so you can focus on the part of
            the product that's actually yours instead of rebuilding
            infrastructure every project needs.
          </p>
        </CardContent>
      </Card>

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
    </div>
  );
}
