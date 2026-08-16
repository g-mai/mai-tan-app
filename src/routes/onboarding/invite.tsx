import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
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
  const { advance, isPending } = useAdvanceOnboarding();
  const org = session.orgs[0];

  // TODO: Add section with current members (to see fake members)
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

      <div className="grid gap-4">
        <InviteMember organizationId={org.id} />
        <PendingInvitations invitations={invitations} organizationId={org.id} />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            No one to invite yet?
          </span>
          <FakerMember organizationId={org.id} />
        </div>
      </div>

      <Button
        className="mt-6"
        disabled={isPending}
        onClick={() => advance({ onboardingStep: "complete" })}
      >
        {isPending ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
