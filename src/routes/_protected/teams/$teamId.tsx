import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "#/components/shared/coming-soon";
import { PageTitle } from "#/components/shared/page-title";
import { getFullTeam } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/teams/$teamId")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const team = await getFullTeam({
      data: {
        id: params.teamId,
        session: context.session,
        user: context.user,
      },
    });
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

  return (
    <div>
      <PageTitle
        title={team.name}
        subtitle={`${team.teamMembers.length} member${team.teamMembers.length === 1 ? "" : "s"}`}
      />
      <ComingSoon
        title="Team management"
        description="Editing team details, adding members, and removing members are on their way."
      />
    </div>
  );
}
