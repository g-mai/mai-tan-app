import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Wip } from "#/components/shared/wip";
import { TeamMembersCard } from "#/features/organizations/components/team-members-card";
import { TeamOverviewCard } from "#/features/organizations/components/team-overview-card";
import { getTeamOverview } from "#/features/organizations/lib/member-management.functions";

export const Route = createFileRoute("/_protected/teams/$teamId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getTeamOverview({ data: { teamId: params.teamId } });
    return team;
  },
  errorComponent: ({ error }) => (
    <RouteError
      title="Team not found"
      message="Error loading team."
      error={error}
    />
  ),
});

function RouteComponent() {
  const team = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <PageTitle title={team.name} />
      <Wip />

      <TeamOverviewCard team={team} />
      {team.members && team.memberCount !== undefined && (
        <TeamMembersCard
          members={team.members.map((row) => ({ id: row.userId, user: row }))}
          total={team.memberCount}
          teamId={team.id}
        />
      )}
    </div>
  );
}
