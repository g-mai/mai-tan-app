import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/onboarding/invite")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "invite"),
  component: RouteComponent,
});

function RouteComponent() {
  const { advance, isPending } = useAdvanceOnboarding();

  return (
    <div className="p-2">
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Invite your teammates
      </h1>
      <div className="text-sm text-muted-foreground mt-2 mb-6 grid gap-2">
        <p>
          Invitations go out by email and stay pending until accepted, so you
          can send them before anyone has an account.
        </p>
        <p>
          <strong>Members</strong> can see the organization and the teams they
          belong to. <strong>Admins</strong> can additionally manage teams and
          invite or remove people. You're the <strong>owner</strong> — the only
          role that can delete the organization.
        </p>
      </div>

      {/* The invite form, pending list and fake-teammate button land here in §9. */}

      <Button
        disabled={isPending}
        onClick={() => advance({ onboardingStep: "complete" })}
      >
        {isPending ? "Saving..." : "Finish"}
      </Button>
    </div>
  );
}
