import { createFileRoute } from "@tanstack/react-router";
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
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { FakerMember } from "#/features/organizations/components/faker-member";
import { InviteMember } from "#/features/organizations/components/invite-member";
import { PendingInvitations } from "#/features/organizations/components/pending-invitations";
import { listOrgInvitations } from "#/features/organizations/lib/invitation.functions";

export const Route = createFileRoute("/onboarding/invite")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "invite"),
  loader: async ({ context }) =>
    listOrgInvitations({ data: { organizationId: context.orgs[0]?.id } }),
  component: RouteComponent,
});

function RouteComponent() {
  const invitations = Route.useLoaderData();
  const session = Route.useRouteContext();
  const { navigate, isPending } = useOnboardingNavigation();
  const org = session.orgs[0];

  // TODO: Add section with current members (to see fake members)
  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/invite" state="step 6 / 7" />
      <ScreenBody>
        <ScreenHeader title="Invite your teammates">
          <p>
            Invitations go out by email and stay pending until accepted, so you
            can send them before anyone has an account.
          </p>
          <p>
            <strong>Members</strong> can see the organization and the teams they
            belong to. <strong>Admins</strong> can additionally manage teams and
            invite or remove people. You're the <strong>owner</strong> — the
            only role that can delete the organization.
          </p>
        </ScreenHeader>

        <div className="mt-6 grid gap-4">
          <InviteMember variant="panel" organizationId={org.id} />
          <PendingInvitations
            variant="panel"
            invitations={invitations}
            organizationId={org.id}
          />
          {/* Dashed = optional escape hatch, not a primary path. */}
          <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              No one to invite yet?
            </span>
            <FakerMember organizationId={org.id} />
          </div>
        </div>
      </ScreenBody>
      <ScreenFooter>
        <OnboardingBackButton step="team" disabled={isPending} />
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
