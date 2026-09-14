import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { ChangelogEntry as Entry } from "#/features/docs/lib/changelog";

export function ChangelogEntry({ entry }: { entry: Entry }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{entry.version}</CardTitle>
          {entry.badge && <Badge variant="secondary">{entry.badge}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {entry.summary && (
          <p className="text-sm text-muted-foreground">{entry.summary}</p>
        )}
        {entry.changes && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {entry.changes.map((change, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static content, never reordered
              <li key={i}>{change}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
