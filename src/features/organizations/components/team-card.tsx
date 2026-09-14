import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { TeamLogo } from "#/features/organizations/components/team-logo";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  color: string | null;
  description?: string | null;
  organization: { name: string };
};

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link to="/teams/$teamId" params={{ teamId: team.id }}>
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
  );
}
