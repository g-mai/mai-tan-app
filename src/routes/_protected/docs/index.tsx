import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/docs/")({
  component: RouteComponent,
});

const features = [
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

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Introduction"
        subtitle="What Mai Tan App is and what's included."
      />

      <Card>
        <CardHeader>
          <CardTitle>What this is</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mai Tan App is a production-ready starter kit for building
            multi-tenant B2B SaaS applications. Authentication, organizations,
            teams, and session management already work end-to-end, so you can
            focus on the part of the product that's actually yours instead of
            rebuilding infrastructure every project needs.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {features.map(({ title, description }) => (
              <li key={title} className="text-sm">
                <span className="font-medium">{title}</span>{" "}
                <span className="text-muted-foreground">— {description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button variant="outline" className="self-start" asChild>
        <Link to="/docs/get-started">Get started</Link>
      </Button>
    </div>
  );
}
