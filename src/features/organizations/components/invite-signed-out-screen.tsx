import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { InviteShell } from "#/features/organizations/components/invite-shell";

/** Signed out — they need an account on the invited address first. */
export function InviteSignedOutScreen({
  invitation,
  invitationId,
}: {
  invitation: { organizationName: string; inviterName: string; email: string };
  invitationId: string;
}) {
  return (
    <InviteShell>
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Join {invitation.organizationName}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        {invitation.inviterName} invited <strong>{invitation.email}</strong> to
        join {invitation.organizationName}. Create your account to accept.
      </p>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link to="/register" search={{ invitation: invitationId }}>
            Create account
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/login" search={{ invitation: invitationId }}>
            I already have one
          </Link>
        </Button>
      </div>
    </InviteShell>
  );
}
