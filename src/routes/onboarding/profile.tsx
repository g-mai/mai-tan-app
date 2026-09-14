import { createFileRoute } from "@tanstack/react-router";
import {
  ScreenBody,
  ScreenCard,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { ProfileAvatarPanel } from "#/features/onboarding/components/profile-avatar-panel";
import { ProfileForm } from "#/features/onboarding/components/profile-form";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/onboarding/profile")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "profile"),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/profile" state="step 2 / 7" />
      <ScreenBody>
        <ScreenHeader
          title="Tell us who you are"
          description="Your name is what teammates see across organizations and teams. A picture is optional."
        />

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <ProfileAvatarPanel user={user} />
          <ProfileForm user={user} />
        </div>
      </ScreenBody>
    </ScreenCard>
  );
}
