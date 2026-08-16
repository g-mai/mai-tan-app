import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { CreateTeam } from "#/features/organizations/components/create-team";

export const Route = createFileRoute("/_protected/teams/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useRouteContext();
  const navigate = Route.useNavigate();

  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle
        title="Create Team"
        subtitle="Create a new team inside one of your organizations"
      />
      {session.orgs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You need an organization first.{" "}
          <Link to="/organizations/new" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <CreateTeam
          organizations={session.orgs}
          onCreated={(team) =>
            navigate({ to: "/teams/$teamId/edit", params: { teamId: team.id } })
          }
        />
      )}
    </div>
  );
}
