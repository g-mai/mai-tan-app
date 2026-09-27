import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import type { MemberFailure } from "#/features/organizations/lib/member-management";

export function MemberResults({
  failures,
  onRetry,
  disabled,
  canRetry,
}: {
  failures: MemberFailure[];
  onRetry?: () => void;
  disabled?: boolean;
  canRetry?: boolean;
}) {
  if (!failures.length) return null;
  return (
    <Alert variant="destructive">
      <AlertTitle>Some memberships could not be updated</AlertTitle>
      <AlertDescription>
        <ul className="grid gap-1">
          {failures.map((failure) => (
            <li key={failure.userId} className="break-all">
              {failure.label}: {failure.message}
            </li>
          ))}
        </ul>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !canRetry}
            onClick={onRetry}
          >
            Retry failed members
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
