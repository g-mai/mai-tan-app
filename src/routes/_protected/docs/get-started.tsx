import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/docs/get-started")({
  component: RouteComponent,
});

const prerequisites = [
  "Node.js 18+",
  "pnpm 11+",
  "Docker (for local PostgreSQL)",
];

const installSteps = `# Clone the repository
git clone <your-repo-url>
cd mai-tan-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start dev server (also starts Docker postgres automatically)
pnpm dev`;

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Get started"
        subtitle="Prerequisites, installation, and environment setup."
      />

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {prerequisites.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            <code>{installSteps}</code>
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Open{" "}
            <a
              href="http://localhost:3000"
              className="underline underline-offset-4"
            >
              http://localhost:3000
            </a>{" "}
            in your browser.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment variables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All required variables — database connection, Better Auth secret,
            Resend API key, and optional Sentry config — are listed with
            descriptions in <code className="text-xs">.env.example</code> at the
            root of the repo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
