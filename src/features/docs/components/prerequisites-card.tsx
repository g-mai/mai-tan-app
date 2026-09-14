import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { PREREQUISITES } from "#/features/docs/lib/docs-content";

export function PrerequisitesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prerequisites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {PREREQUISITES.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
