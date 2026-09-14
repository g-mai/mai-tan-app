import { createFileRoute } from "@tanstack/react-router";
import { AlreadyMemberScreen } from "#/features/onboarding/components/already-member-screen";
import { CreateOrgScreen } from "#/features/onboarding/components/create-org-screen";
import { InvitationsScreen } from "#/features/onboarding/components/invitations-screen";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { listMyInvitations } from "#/features/organizations/lib/invitation.functions";

export const Route = createFileRoute("/onboarding/organization")({
  beforeLoad: ({ context }) =>
    ensureOnboardingStep(context.user, "organization"),
  loader: async () => listMyInvitations(),
  component: RouteComponent,
});

function RouteComponent() {
  const invitations = Route.useLoaderData();
  const session = Route.useRouteContext();

  // Already joined one — through an invitation link, most likely.
  if (session.orgs.length > 0) {
    return <AlreadyMemberScreen org={session.orgs[0]} />;
  }

  if (invitations.length > 0) {
    return <InvitationsScreen invitations={invitations} />;
  }

  return <CreateOrgScreen />;
}
