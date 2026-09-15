import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Wip } from "#/components/shared/wip";
import { MemberList } from "#/features/organizations/components/member-list";
import { OrgManageSection } from "#/features/organizations/components/org-manage-section";
import { OrgOverviewCard } from "#/features/organizations/components/org-overview-card";
import { OrgTeamsCard } from "#/features/organizations/components/org-teams-card";
import { getOrganization } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/organizations/$orgId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const org = await getOrganization({ data: { id: params.orgId } });
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
  const session = Route.useRouteContext();

  // TODO: add subscription section
  return (
    <div className="space-y-6">
      <PageTitle title={org.name} />
      <Wip />

      <OrgOverviewCard org={org} />

      <div className="grid gap-6 md:grid-cols-2">
        <MemberList members={org.members} />
        <OrgTeamsCard teams={org.teams} />
      </div>

      <OrgManageSection org={org} currentUserId={session.user.id} />
    </div>
  );
}
