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
          what the Worker reads — the Better Auth secret, Resend API key, and
          public image URL. Resend is optional until email is used. D1 and R2
          arrive as Worker bindings; local image uploads and previews work with
          the template defaults and need no Cloudflare credentials.
        </p>
      </CardContent>
    </Card>
  );
}
