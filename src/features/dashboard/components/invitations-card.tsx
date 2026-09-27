import { Globe, Inbox, Send } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import { useAcceptInvitation } from "#/features/organizations/hooks/useAcceptInvitation";
import { useCancelInvitation } from "#/features/organizations/hooks/useCancelInvitation";
import { useDeclineInvitation } from "#/features/organizations/hooks/useDeclineInvitation";
import { useResendInvitation } from "#/features/organizations/hooks/useResendInvitation";
import { filterPending } from "#/features/organizations/lib/invitation";
import { cn } from "#/lib/utils";

type IncomingInvitation = {
  id: string;
  status: string;
  role?: string | null;
  organizationName?: string | null;
  inviterEmail?: string | null;
  expiresAt: Date | string;
};

type SentInvitation = {
  id: string;
  email: string;
  status: string;
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
  myInvitations,
  orgInvitations,
  isManager,
}: {
  orgId: string;
  myInvitations: IncomingInvitation[];
  orgInvitations: SentInvitation[];
  isManager: boolean;
}) {
  const { accept, isPending: isAccepting } = useAcceptInvitation();
  const { decline, isPending: isDeclining } = useDeclineInvitation();
  const { resend, isPending: isResending } = useResendInvitation();
  const { cancel, isPending: isCancelling } = useCancelInvitation();

  // Better Auth returns every status, expired rows included.
  const incoming = filterPending(myInvitations);
  const sent = isManager ? filterPending(orgInvitations) : [];

  if (incoming.length === 0 && sent.length === 0) {
    return (
      <Empty className="flex-row justify-start rounded-xl border bg-card px-6 py-5 text-left shadow-sm">
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyHeader className="items-start">
          <EmptyTitle>No invitations</EmptyTitle>
          <EmptyDescription>
            {isManager
              ? "Incoming and sent invitations will appear here."
              : "Invitations to join other organizations will appear here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      className={cn("grid items-start gap-4", isManager && "xl:grid-cols-2")}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Inbox className="size-4 text-muted-foreground" />
              Waiting for you
            </span>
          </CardTitle>
          <CardDescription>
            Invitations to join other organizations.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">{incoming.length}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing waiting for you right now.
            </p>
          ) : (
            <ul className="divide-y">
              {incoming.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                    <Globe className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 basis-32">
                    <p className="truncate text-sm font-medium">
                      {invitation.organizationName}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Send className="size-4 text-muted-foreground" />
                Organization invitations
              </span>
            </CardTitle>
            <CardDescription>
              Sent invitations awaiting a response.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">{sent.length} pending</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            {sent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No invitations waiting to be accepted.
              </p>
            ) : (
              <ul className="divide-y">
                {sent.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1 basis-44">
                      <p
                        className="truncate text-sm font-medium"
                        title={invitation.email}
                      >
                        {invitation.email}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <RoleBadge role={invitation.role ?? "member"} />
                        <p className="text-xs text-muted-foreground">
                          {expiresIn(invitation.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isResending}
                        onClick={() =>
                          resend({
                            email: invitation.email,
                            role: invitation.role ?? "member",
                            organizationId: orgId,
                          })
                        }
                      >
                        Resend
                      </Button>
                      <Button
                        type="button"
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
