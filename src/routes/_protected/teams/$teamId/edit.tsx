import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Wip } from "#/components/shared/wip";
import { EditTeam } from "#/features/organizations/components/edit-team";
import { canManage } from "#/features/organizations/lib/org";
import { getFullTeam } from "#/features/organizations/lib/team.functions";

export const Route = createFileRoute("/_protected/teams/$teamId/edit")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getFullTeam({ data: { id: params.teamId } });
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
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle title="Edit team" subtitle={team.organization.name} />
      <Wip />
      {canManage(team.role) ? (
        <EditTeam team={team} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Only owners and admins of {team.organization.name} can edit this team.
        </p>
      )}
    </div>
  );
}
