import { createFileRoute } from "@tanstack/react-router";
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
        <h1>Team not found</h1>
        <p>Error loading team.</p>
        {props.error instanceof Error && <p>{props.error.message}</p>}
      </div>
    );
  },
});

function RouteComponent() {
  const team = Route.useLoaderData();
  // console.log("TEAM DATA", team);
  return <div>Hello "/_protected/teams/$id"!</div>;
}
