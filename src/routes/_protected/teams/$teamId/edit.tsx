import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { DangerAreaCard } from "#/components/shared/danger-area-card";
import { RouteError } from "#/components/shared/route-error";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { DeleteTeamDialog } from "#/features/organizations/components/delete-team-dialog";
import { EditTeam } from "#/features/organizations/components/edit-team";
import { RoleBadge } from "#/features/organizations/components/role-badge";
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
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Edit team</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Manage your team’s name, description, and appearance.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium break-words">{team.name}</span>
            <RoleBadge role={team.role} />
          </div>
          <p className="text-xs text-muted-foreground break-words">
            Organization: {team.organization.name}
          </p>
        </div>
        <Button asChild variant="outline" className="self-start lg:self-center">
          <Link to="/teams/$teamId" params={{ teamId: team.id }}>
            <ArrowLeft data-icon="inline-start" />
            Back to team
          </Link>
        </Button>
      </header>
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
        <Alert>
          <LockKeyhole aria-hidden="true" />
          <AlertTitle>Editing is restricted</AlertTitle>
          <AlertDescription>
            Only owners and admins of {team.organization.name} can edit this
            team.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
