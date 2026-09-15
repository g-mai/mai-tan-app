import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { OnboardingBackButton } from "#/features/onboarding/components/onboarding-back-button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { CreateOrg } from "#/features/organizations/components/create-org";

export function CreateOrgScreen() {
  const { navigate, isPending } = useOnboardingNavigation();

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/organization" state="step 3 / 7" />
      <ScreenBody>
        <ScreenHeader
          title="Create your organization"
          description="An organization is the top-level container for your people, teams and billing. You can create more later."
        />

        <div className="mt-6">
          <CreateOrg
            variant="panel"
            onCreated={() => navigate({ onboardingStep: "subscription" })}
          />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <OnboardingBackButton step="profile" disabled={isPending} />
      </ScreenFooter>
    </ScreenCard>
  );
}
