import { Construction } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <CardTitle>{title}</CardTitle>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
          <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Construction className="size-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
