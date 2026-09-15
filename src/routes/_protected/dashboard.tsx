import { createFileRoute } from "@tanstack/react-router";
import { DashboardHero } from "#/features/dashboard/components/dashboard-hero";
import { DocsCard } from "#/features/dashboard/components/docs-card";
import { InvitationsCard } from "#/features/dashboard/components/invitations-card";
import { MembersTeamsRow } from "#/features/dashboard/components/members-teams-row";
import { OrgPlanRow } from "#/features/dashboard/components/org-plan-row";
import { RunLocallyCard } from "#/features/dashboard/components/run-locally-card";
import { listMyInvitations } from "#/features/organizations/lib/invitation.functions";
import { getOrganization } from "#/features/organizations/lib/org.functions";
import { listOrgTeamsWithCounts } from "#/features/organizations/lib/team.functions";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
  loader: async ({ context }) => {
    // Onboarding guarantees a membership, but not that one was ever made
    // active — fall back the way the org switcher does.
    const orgId = context.session.activeOrganizationId ?? context.orgs[0]?.id;
    const myInvitations = await listMyInvitations();

    if (!orgId) return { org: null, teams: [], myInvitations };

    const [org, teams] = await Promise.all([
      getOrganization({ data: { id: orgId } }),
      listOrgTeamsWithCounts({ data: { organizationId: orgId } }),
    ]);

    return { org, teams, myInvitations };
  },
});

function RouteComponent() {
  const { user, orgs } = Route.useRouteContext();
  const { org, teams, myInvitations } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <DashboardHero
        firstName={user.firstName || user.name}
        orgId={org?.id}
        orgCount={orgs.length}
        members={org?.members ?? []}
        teams={teams}
        currentUserId={user.id}
      />

      {org && (
        <>
          <OrgPlanRow org={org} teams={teams} currentUserId={user.id} />
          <MembersTeamsRow
            orgId={org.id}
            orgSlug={org.slug}
            members={org.members}
            teams={teams}
            currentUserId={user.id}
          />
          <InvitationsCard
            orgId={org.id}
            myInvitations={myInvitations}
            orgInvitations={org.invitations}
          />
        </>
      )}

      <RunLocallyCard />
      <DocsCard />
    </div>
  );
}
