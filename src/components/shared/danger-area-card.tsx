import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

export function DangerAreaCard({
  description,
  buttonLabel,
  disabled,
  onClick,
}: {
  description: string;
  buttonLabel: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Dangerous area</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="destructive"
          disabled={disabled}
          onClick={onClick}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
