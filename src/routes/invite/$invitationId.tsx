import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import { Button } from "#/components/ui/button";
import { Card } from "#/components/ui/card";
import { signOut, updateUser } from "#/features/auth/lib/auth-client";
import Footer from "#/features/layout/components/footer";
import { getOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { useAcceptInvitation } from "#/features/organizations/hooks/useAcceptInvitation";
import { getInvitationPreview } from "#/features/organizations/lib/invitation.functions";

export const Route = createFileRoute("/invite/$invitationId")({
  loader: async ({ params }) =>
    getInvitationPreview({ data: { id: params.invitationId } }),
  component: RouteComponent,
});

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <LogoTitle href="/" className="flex gap-4 mx-auto" />
        <Card className="w-full max-w-md mx-auto mt-10 p-6">{children}</Card>
      </main>
      <Footer />
    </div>
  );
}

function RouteComponent() {
  const invitation = Route.useLoaderData();
  const { invitationId } = Route.useParams();
  const { session } = Route.useRouteContext();
  const router = useRouter();

  const { accept, isPending } = useAcceptInvitation({
    onAccepted: async () => {
      const step = getOnboardingStep(session?.user);

      // Still owes us a password or a name — let them finish that first.
      if (step === "password" || step === "profile") {
        router.navigate({ to: "/register/password" });
        return;
      }

      // Mid-onboarding: they belong to an organization now, so the remaining
      // setup steps are someone else's job.
      if (step) {
        await updateUser({ onboardingStep: "complete" });
        await router.invalidate();
        router.navigate({ to: "/onboarding/complete" });
        return;
      }

      router.navigate({ to: "/dashboard" });
    },
  });

  if (invitation.status === "invalid") {
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

  // Signed out — they need an account on the invited address first.
  if (!session) {
    return (
      <InviteShell>
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Join {invitation.organizationName}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          {invitation.inviterName} invited <strong>{invitation.email}</strong>{" "}
          to join {invitation.organizationName}. Create your account to accept.
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

  // Signed in as somebody else. Show it, never act on it — signing them out
  // automatically would destroy an unrelated session on a stray click.
  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <InviteShell>
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          This invitation is for someone else
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          It was sent to <strong>{invitation.email}</strong>, but you're signed
          in as <strong>{session.user.email}</strong>.
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

  return (
    <InviteShell>
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Join {invitation.organizationName}
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        {invitation.inviterName} invited you to join{" "}
        {invitation.organizationName}.
      </p>
      <Button
        className="w-fit"
        disabled={isPending}
        onClick={() => accept(invitationId)}
      >
        {isPending ? "Joining..." : `Join ${invitation.organizationName}`}
      </Button>
    </InviteShell>
  );
}
