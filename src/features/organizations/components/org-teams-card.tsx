import { Link } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { Separator } from "#/components/ui/separator";
import { TeamLogo } from "#/features/organizations/components/team-logo";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  color?: string | null;
};

export function OrgTeamsCard({ teams }: { teams: Team[] }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="p-5">
        <CardTitle>Teams</CardTitle>
        <CardDescription>
          {teams.length} team{teams.length === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {teams.length === 0 && (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No teams yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
        <ul>
          {teams.map((team, i) => (
            <li key={team.id}>
              <Link
                to="/teams/$teamId"
                params={{ teamId: team.id }}
                className="block transition-colors hover:bg-muted/50 focus-visible:outline-ring"
              >
                {i > 0 && <Separator />}
                <div className="flex items-center gap-3 px-5 py-4">
                  <TeamLogo
                    logoUrl={team.logo}
                    name={team.name}
                    color={team.color}
                    size={36}
                    className="shrink-0"
                  />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {team.name}
                  </p>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
