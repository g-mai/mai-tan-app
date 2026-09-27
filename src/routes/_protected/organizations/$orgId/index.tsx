import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Wip } from "#/components/shared/wip";
import { MemberList } from "#/features/organizations/components/member-list";
import { OrgOverviewCard } from "#/features/organizations/components/org-overview-card";
import { OrgTeamsCard } from "#/features/organizations/components/org-teams-card";
import { getOrganizationOverview } from "#/features/organizations/lib/member-management.functions";

export const Route = createFileRoute("/_protected/organizations/$orgId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const org = await getOrganizationOverview({
      data: { organizationId: params.orgId },
    });
    return org;
  },
  errorComponent: ({ error }) => (
    <RouteError
      title="Organization not found"
      message="Error loading organization."
      error={error}
    />
  ),
});

function RouteComponent() {
  const org = Route.useLoaderData();

  // TODO: add subscription section
  return (
    <div className="space-y-6">
      <PageTitle title={org.name} />
      <Wip />

      <OrgOverviewCard org={org} />

      <div className="grid gap-6 md:grid-cols-2">
        <MemberList
          members={org.members.map((row) => ({
            id: row.memberId,
            role: row.role,
            user: row,
          }))}
          total={org.memberCount}
          organizationId={org.id}
        />
        <OrgTeamsCard teams={org.teams} />
      </div>
    </div>
  );
}
