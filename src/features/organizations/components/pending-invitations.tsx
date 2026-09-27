import { Mail } from "lucide-react";
import { SectionPanel } from "#/components/shared/screen-shell";
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
      : `${pending.length} invitation${pending.length === 1 ? "" : "s"} waiting to be accepted`;

  const rows =
    pending.length > 0 ? (
      <ul className="divide-y">
        {pending.map((invitation) => (
          <li
            key={invitation.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0"
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
                  Expires{" "}
                  {new Date(invitation.expiresAt).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
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
    ) : (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail />
          </EmptyMedia>
          <EmptyTitle>No pending invitations</EmptyTitle>
          <EmptyDescription>
            Invitations will appear here until they are accepted.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>{description}</CardDescription>
          <CardAction>
            <Badge variant="secondary">{pending.length}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>{rows}</CardContent>
      </Card>
    );
  }

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
