import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { InviteShell } from "#/features/organizations/components/invite-shell";

export function InviteInvalidScreen() {
  return (
    <InviteShell>
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        This invitation is no longer valid
      </h1>
      <p className="text-sm text-muted-foreground mt-2">
        It may have expired, been cancelled, or already been used. Ask whoever
        invited you to send a new one.
      </p>
      <Button asChild variant="outline" className="mt-6 w-fit">
        <Link to="/">Back to home</Link>
      </Button>
    </InviteShell>
  );
}
