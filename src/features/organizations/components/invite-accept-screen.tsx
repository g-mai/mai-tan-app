import { useRouter } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { updateUser } from "#/features/auth/lib/auth-client";
import type { User } from "#/features/auth/types";
import { getOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { InviteShell } from "#/features/organizations/components/invite-shell";
import { useAcceptInvitation } from "#/features/organizations/hooks/useAcceptInvitation";

export function InviteAcceptScreen({
  invitation,
  invitationId,
  user,
}: {
  invitation: { organizationName: string; inviterName: string };
  invitationId: string;
  user: User;
}) {
  const router = useRouter();

  const { accept, isPending } = useAcceptInvitation({
    onAccepted: async () => {
      const step = getOnboardingStep(user);

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
