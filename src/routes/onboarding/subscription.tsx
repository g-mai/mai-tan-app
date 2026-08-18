import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "#/components/shared/coming-soon";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/onboarding/subscription")({
  beforeLoad: ({ context }) =>
    ensureOnboardingStep(context.user, "subscription"),
  component: RouteComponent,
});

function RouteComponent() {
  const { navigate, isPending } = useOnboardingNavigation();

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/subscription" state="step 4 / 7" />
      <ScreenBody>
        <ScreenHeader title="Pick a plan" description="Nothing to pay today." />

        <div className="mt-6">
          <ComingSoon
            title="Subscriptions"
            description="Billing arrives once Stripe is integrated: plans are scoped to an organization and priced per seat, so every member you invite counts towards it. Until then every organization has full access."
          />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <span className="font-mono text-[11px]">no card required</span>
        <Button
          disabled={isPending}
          onClick={() => navigate({ onboardingStep: "team" })}
        >
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </ScreenFooter>
    </ScreenCard>
  );
}
