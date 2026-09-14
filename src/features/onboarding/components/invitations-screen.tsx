import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { InvitationList } from "#/features/onboarding/components/invitation-list";
import { OnboardingBackButton } from "#/features/onboarding/components/onboarding-back-button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { CreateOrg } from "#/features/organizations/components/create-org";
import { useAcceptInvitation } from "#/features/organizations/hooks/useAcceptInvitation";

type Invitation = {
  id: string;
  role?: string | null;
  organizationName?: string | null;
};

export function InvitationsScreen({
  invitations,
}: {
  invitations: Invitation[];
}) {
  const { navigate, isPending } = useOnboardingNavigation();

  // Accepting drops them at the end of the flow: the steps that follow
  // (subscription, team, invites) belong to whoever owns the organization.
  const { accept, isPending: isAccepting } = useAcceptInvitation({
    onAccepted: () => navigate({ onboardingStep: "complete" }),
  });

  const count = invitations.length;

  return (
    <ScreenCard>
      <ScreenStrip
        path="onboarding/organization"
        state={`${count} invitation${count > 1 ? "s" : ""}`}
        tone="secondary"
      />
      <ScreenBody>
        <ScreenHeader
          title="You've been invited"
          description="Join an organization you were invited to, or start your own instead."
        />

        <InvitationList
          invitations={invitations}
          onAccept={accept}
          isAccepting={isAccepting}
        />

        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
            OR
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <CreateOrg
          variant="panel"
          onCreated={() => navigate({ onboardingStep: "subscription" })}
        />
      </ScreenBody>
      <ScreenFooter>
        <OnboardingBackButton
          step="profile"
          disabled={isPending || isAccepting}
        />
      </ScreenFooter>
    </ScreenCard>
  );
}
