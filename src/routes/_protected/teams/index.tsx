import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { TeamCard } from "#/features/organizations/components/team-card";
import { listTeams } from "#/features/organizations/lib/team.functions";

export const Route = createFileRoute("/_protected/teams/")({
  component: RouteComponent,
  loader: async () => {
    const teams = await listTeams();
    return teams;
  },
});

function RouteComponent() {
  const teams = Route.useLoaderData();
  const organizationCount = new Set(teams.map((team) => team.organizationId))
    .size;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Teams</h1>
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground text-pretty">
            A unified view of every team across your organizations. Find a team
            and open its overview to explore the people in it.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {teams.length} team{teams.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline">
              Across {organizationCount} organization
              {organizationCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
        <Button asChild className="self-start lg:self-center">
          <Link to="/teams/new">
            <Plus data-icon="inline-start" />
            New team
          </Link>
        </Button>
      </header>

      {teams.length === 0 ? (
        <Empty className="border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No teams yet</EmptyTitle>
            <EmptyDescription>
              Teams bring a smaller group of people together within an
              organization. Create your first team to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/teams/new">Create a team</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <section
          aria-labelledby="teams-heading"
          className="overflow-hidden rounded-xl border bg-card shadow-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-5">
            <h2 id="teams-heading" className="text-base font-semibold">
              Team directory
            </h2>
            <p className="text-xs text-muted-foreground">Sorted by name</p>
          </div>
          <ul className="divide-y border-t">
            {teams.map((team) => (
              <li key={team.id}>
                <TeamCard team={team} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
