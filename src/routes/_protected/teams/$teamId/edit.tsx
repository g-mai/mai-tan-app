import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { EditTeam } from "#/features/organizations/components/edit-team";
import { getFullTeam } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/teams/$teamId/edit")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getFullTeam({ data: { id: params.teamId } });
    return team;
  },
  errorComponent: (props) => {
    return (
      <div>
        <PageTitle title="Team not found" />
        <p className="text-sm text-muted-foreground">Error loading team.</p>
        {props.error instanceof Error && (
          <p className="text-sm text-muted-foreground">{props.error.message}</p>
        )}
      </div>
    );
  },
});

function RouteComponent() {
  const team = Route.useLoaderData();
  const canManage = team.role === "owner" || team.role === "admin";

  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle title="Edit team" subtitle={team.organization.name} />
      {canManage ? (
        <EditTeam team={team} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Only owners and admins of {team.organization.name} can edit this team.
        </p>
      )}
    </div>
  );
}
