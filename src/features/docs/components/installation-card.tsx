import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { INSTALL_STEPS } from "#/features/docs/lib/docs-content";

export function InstallationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{INSTALL_STEPS}</code>
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
  );
}
