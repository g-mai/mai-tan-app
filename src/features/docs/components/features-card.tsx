import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { FEATURES } from "#/features/docs/lib/docs-content";

export function FeaturesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {FEATURES.map(({ title, description }) => (
            <li key={title} className="text-sm">
              <span className="font-medium">{title}</span>{" "}
              <span className="text-muted-foreground">— {description}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
