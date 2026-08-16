import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
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
}: {
  invitations: Invitation[];
  organizationId: string;
}) {
  const { cancel, isPending: isCancelling } = useCancelInvitation();
  const { resend, isPending: isResending } = useResendInvitation();

  // Better Auth returns every status, expired rows included.
  const pending = invitations.filter(
    (invitation) =>
      invitation.status === "pending" &&
      new Date(invitation.expiresAt) > new Date(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending invitations</CardTitle>
        <CardDescription>
          {pending.length === 0
            ? "No one is waiting to join."
            : `${pending.length} waiting to be accepted`}
        </CardDescription>
      </CardHeader>
      {pending.length > 0 && (
        <CardContent className="p-0">
          <ul>
            {pending.map((invitation, i) => (
              <li key={invitation.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invitation.role ?? "member"} · expires{" "}
                      {new Date(invitation.expiresAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
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
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
