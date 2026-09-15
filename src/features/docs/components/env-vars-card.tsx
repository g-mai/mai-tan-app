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
          the Cloudflare credentials for Drizzle Kit and the{" "}
          <code className="text-xs">VITE_*</code> build values.{" "}
          <code className="text-xs">.dev.vars.example</code> covers what the
          Worker reads — the Better Auth secret, Resend API key, and R2
          credentials. Both are at the root of the repo, with descriptions
          inline. The database is not among them: D1 arrives as a Worker
          binding.
        </p>
      </CardContent>
    </Card>
  );
}
