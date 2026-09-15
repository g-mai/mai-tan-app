import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function EnvVarsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment variables</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          There are two files, because two runtimes read them.{" "}
          <code className="text-xs">.env.example</code> covers what Node reads —
          Cloudflare credentials for Drizzle Kit, public{" "}
          <code className="text-xs">VITE_*</code> values, and Sentry build
          settings. <code className="text-xs">.dev.vars.example</code> covers
          what the Worker reads — the Better Auth secret, Resend API key, and R2
          credentials. Resend and R2 are optional until their features are used.
          The database is not among them: D1 arrives as a Worker binding.
        </p>
      </CardContent>
    </Card>
  );
}
