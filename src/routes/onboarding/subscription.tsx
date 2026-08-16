import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "#/components/shared/coming-soon";
import { Button } from "#/components/ui/button";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/onboarding/subscription")({
  beforeLoad: ({ context }) =>
    ensureOnboardingStep(context.user, "subscription"),
  component: RouteComponent,
});

function RouteComponent() {
  const { advance, isPending } = useAdvanceOnboarding();

  return (
    <div className="p-2">
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Pick a plan
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        Nothing to pay today.
      </p>

      <ComingSoon
        title="Subscriptions"
        description="Billing arrives once Stripe is integrated: plans are scoped to an organization and priced per seat, so every member you invite counts towards it. Until then every organization has full access."
      />

      <Button
        className="mt-6"
        disabled={isPending}
        onClick={() => advance({ onboardingStep: "team" })}
      >
        {isPending ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
