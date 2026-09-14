import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { OnboardingBackButton } from "#/features/onboarding/components/onboarding-back-button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";

/** Reached through an invitation link — there is no organization to set up. */
export function AlreadyMemberScreen({ org }: { org: { name: string } }) {
  const { navigate, isPending } = useOnboardingNavigation();

  return (
    <ScreenCard>
      <ScreenStrip
        path="onboarding/organization"
        state="already a member"
        tone="primary"
      />
      <ScreenBody>
        <ScreenHeader
          title={`You're in ${org.name}`}
          description="You already belong to an organization, so there's nothing to set up here. You can always create your own later."
        />
      </ScreenBody>
      <ScreenFooter>
        <OnboardingBackButton step="profile" disabled={isPending} />
        <Button
          disabled={isPending}
          onClick={() => navigate({ onboardingStep: "complete" })}
        >
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </ScreenFooter>
    </ScreenCard>
  );
}
