import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { REST_OF_STACK } from "#/features/docs/lib/stack";

export function StackListCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Also in the stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {REST_OF_STACK.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
