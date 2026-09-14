import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { HIGHLIGHTS } from "#/features/docs/lib/stack";

export function StackHighlights() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HIGHLIGHTS.map(({ title, description, href, icon: Icon }) => (
        <Link to={href} key={title}>
          <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
