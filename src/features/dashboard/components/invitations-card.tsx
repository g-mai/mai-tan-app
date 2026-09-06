import { Globe, Inbox, Send } from "lucide-react";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import { useAcceptInvitation } from "#/features/organizations/hooks/useAcceptInvitation";
import { useCancelInvitation } from "#/features/organizations/hooks/useCancelInvitation";
import { useDeclineInvitation } from "#/features/organizations/hooks/useDeclineInvitation";
import { useResendInvitation } from "#/features/organizations/hooks/useResendInvitation";
import { Button } from "@/components/ui/button";

type IncomingInvitation = {
  id: string;
  role?: string | null;
  organizationName?: string | null;
  inviterEmail?: string | null;
};

type SentInvitation = {
  id: string;
  email: string;
  role?: string | null;
  expiresAt: Date | string;
};

function expiresIn(expiresAt: Date | string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const days = Math.round(ms / 86_400_000);

  return Math.abs(days) >= 1
    ? `expires ${format.format(days, "day")}`
    : `expires ${format.format(Math.round(ms / 3_600_000), "hour")}`;
}

export function InvitationsCard({
  orgId,
  incoming,
  sent,
}: {
  orgId: string;
  incoming: IncomingInvitation[];
  sent: SentInvitation[];
}) {
  const { accept, isPending: isAccepting } = useAcceptInvitation();
  const { decline, isPending: isDeclining } = useDeclineInvitation();
  const { resend, isPending: isResending } = useResendInvitation();
  const { cancel, isPending: isCancelling } = useCancelInvitation();

  if (incoming.length === 0 && sent.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-xl border bg-card px-6 py-5 shadow-sm">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Inbox className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">No invitations</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Invites you send and invites waiting for you both appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid rounded-xl border bg-card shadow-sm md:grid-cols-2">
      <div className="border-b px-6 py-5 md:border-r md:border-b-0">
        <div className="mb-4 flex items-center gap-2">
          <Inbox className="size-4 text-primary" />
          <p className="text-base font-semibold">Waiting for you</p>
        </div>
        {incoming.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nothing waiting for you right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {incoming.map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted p-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <Globe className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {invitation.organizationName}
                  </p>
                  <p className="truncate font-mono text-2xs text-muted-foreground">
                    {invitation.inviterEmail
                      ? `${invitation.inviterEmail} · `
                      : ""}
                    as {invitation.role ?? "member"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    disabled={isAccepting || isDeclining}
                    onClick={() => accept(invitation.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isAccepting || isDeclining}
                    onClick={() => decline(invitation.id)}
                  >
                    Decline
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Send className="size-4 text-muted-foreground" />
            <p className="text-base font-semibold">Sent by you</p>
          </div>
          <span className="font-mono text-2xs text-muted-foreground">
            {sent.length} pending
          </span>
        </div>
        {sent.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No invitations waiting to be accepted.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sent.map((invitation) => (
              <li key={invitation.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs">
                    {invitation.email}
                  </p>
                  <p className="truncate font-mono text-2xs text-muted-foreground">
                    {expiresIn(invitation.expiresAt)}
                  </p>
                </div>
                <RoleBadge role={invitation.role ?? "member"} />
                <button
                  type="button"
                  disabled={isResending}
                  onClick={() =>
                    resend({
                      email: invitation.email,
                      role: invitation.role ?? "member",
                      organizationId: orgId,
                    })
                  }
                  className="shrink-0 text-xs text-primary hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => cancel(invitation.id)}
                  className="shrink-0 text-xs text-muted-foreground hover:underline disabled:opacity-50"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
