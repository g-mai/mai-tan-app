import { Button } from "#/components/ui/button";

type Invitation = {
  id: string;
  role?: string | null;
  organizationName?: string | null;
};

/** Invitation rows: rust left rule instead of a nested Card. */
export function InvitationList({
  invitations,
  onAccept,
  isAccepting,
}: {
  invitations: Invitation[];
  onAccept: (invitationId: string) => void;
  isAccepting: boolean;
}) {
  return (
    <div className="mt-6 grid gap-3">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex flex-col gap-3 rounded-lg border border-l-[3px] border-l-secondary bg-muted p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {invitation.organizationName}
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              as {invitation.role ?? "member"}
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            disabled={isAccepting}
            onClick={() => onAccept(invitation.id)}
          >
            {isAccepting ? "Joining..." : `Join ${invitation.organizationName}`}
          </Button>
        </div>
      ))}
    </div>
  );
}
