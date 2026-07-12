import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { TeamLogo } from "#/features/organizations/components/team-logo";
import { listTeams } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/teams/")({
  component: RouteComponent,
  loader: async () => {
    const teams = await listTeams();
    return teams;
  },
});

function RouteComponent() {
  const teams = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Teams"
        subtitle="A unified view of every team across your organizations."
      />

      <div>
        <Button asChild>
          <Link to="/teams/new">New team</Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No teams yet.{" "}
          <Link to="/teams/new" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        teams.map((team) => (
          <Link to="/teams/$teamId" params={{ teamId: team.id }} key={team.id}>
            <Card className="min-w-sm cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <TeamLogo
                    logoUrl={team.logo}
                    name={team.name}
                    color={team.color}
                    size={48}
                  />
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.organization.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {team.description || "No description"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
