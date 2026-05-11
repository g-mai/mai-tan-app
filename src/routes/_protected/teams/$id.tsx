import { createFileRoute } from "@tanstack/react-router";
import { getTeam } from "#/lib/better-auth/org-functions";

export const Route = createFileRoute("/_protected/teams/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getTeam({ data: { id: params.id } });
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

// TODO: FIX ROUTE FOR TEAMS YOU'RE NOT PART OF
// the organization page lists all teams, it should just show the teams you're part of
// except for admins/owners
// and also fix the getTeam server function, it should get the actual team
function RouteComponent() {
  const team = Route.useLoaderData();
  console.log("TEAM DATA", team);
  return <div>Hello "/_protected/teams/$id"!</div>;
}
