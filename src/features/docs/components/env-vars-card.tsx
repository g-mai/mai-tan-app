import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function EnvVarsCard() {
  return (
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
  );
}
