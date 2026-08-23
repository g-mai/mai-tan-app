import { SectionPanel } from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { useCancelInvitation } from "#/features/organizations/hooks/useCancelInvitation";
import { useResendInvitation } from "#/features/organizations/hooks/useResendInvitation";

type Invitation = {
  id: string;
  email: string;
  role?: string | null;
  status: string;
  expiresAt: Date | string;
};

export function PendingInvitations({
  invitations,
  organizationId,
  variant = "card",
  className,
}: {
  invitations: Invitation[];
  organizationId: string;
  variant?: "card" | "panel";
  className?: string;
}) {
  const { cancel, isPending: isCancelling } = useCancelInvitation();
  const { resend, isPending: isResending } = useResendInvitation();

  // Better Auth returns every status, expired rows included.
  const pending = invitations.filter(
    (invitation) =>
      invitation.status === "pending" &&
      new Date(invitation.expiresAt) > new Date(),
  );

  const description =
    pending.length === 0
      ? "No one is waiting to join."
      : `${pending.length} waiting to be accepted`;

  const rows = pending.length > 0 && (
    <ul className="divide-y">
      {pending.map((invitation) => (
        <li
          key={invitation.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{invitation.email}</p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {invitation.role ?? "member"} · expires{" "}
              {new Date(invitation.expiresAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={isResending}
              onClick={() =>
                resend({
                  email: invitation.email,
                  role: invitation.role ?? "member",
                  organizationId,
                })
              }
            >
              Resend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isCancelling}
              onClick={() => cancel(invitation.id)}
            >
              Cancel
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <SectionPanel
      title="Pending invitations"
      description={description}
      action={
        pending.length > 0 && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {pending.length}
          </span>
        )
      }
      variant={variant}
      className={className}
    >
      {rows}
    </SectionPanel>
  );
}
