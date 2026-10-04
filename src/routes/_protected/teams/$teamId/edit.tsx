import { createFileRoute } from "@tanstack/react-router";
import { DangerAreaCard } from "#/components/shared/danger-area-card";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Wip } from "#/components/shared/wip";
import { DeleteTeamDialog } from "#/features/organizations/components/delete-team-dialog";
import { EditTeam } from "#/features/organizations/components/edit-team";
import { useDeleteTeam } from "#/features/organizations/hooks/useDeleteTeam";
import { canManage } from "#/features/organizations/lib/org";
import { getTeamMetadata } from "#/features/organizations/lib/team.functions";

export const Route = createFileRoute("/_protected/teams/$teamId/edit")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getTeamMetadata({ data: { id: params.teamId } });
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
  const deletion = useDeleteTeam(team.id);

  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle title="Edit team" subtitle={team.organization.name} />
      <Wip />
      {canManage(team.role) ? (
        <>
          <EditTeam team={team} />
          <DangerAreaCard
            description="Permanently deletes this team and removes its team memberships. Members remain in the organization. This cannot be undone."
            buttonLabel="Delete team"
            disabled={deletion.isPending}
            onClick={deletion.open}
          />
          <DeleteTeamDialog action={deletion} teamName={team.name} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Only owners and admins of {team.organization.name} can edit this team.
        </p>
      )}
    </div>
  );
}
