import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { signOut } from "#/features/auth/lib/auth-client";
import { InviteShell } from "#/features/organizations/components/invite-shell";

/**
 * Signed in as somebody else. Show it, never act on it — signing them out
 * automatically would destroy an unrelated session on a stray click.
 */
export function InviteWrongUserScreen({
  invitedEmail,
  signedInEmail,
}: {
  invitedEmail: string;
  signedInEmail: string;
}) {
  const router = useRouter();

  return (
    <InviteShell>
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        This invitation is for someone else
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        It was sent to <strong>{invitedEmail}</strong>, but you're signed in as{" "}
        <strong>{signedInEmail}</strong>.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={async () => {
            await signOut();
            await router.invalidate();
          }}
        >
          Sign out and continue
        </Button>
        <Button asChild variant="ghost">
          <Link to="/dashboard">Go to the app</Link>
        </Button>
      </div>
    </InviteShell>
  );
}
