import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";

type Team = { id: string; name: string };

export function OrgTeamsCard({ teams }: { teams: Team[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <CardDescription>{teams.length} total</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul>
          {teams.map((team, i) => (
            <li key={team.id}>
              <Link
                to="/teams/$teamId"
                params={{ teamId: team.id }}
                className="block"
              >
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-6 py-3">
                  <p className="text-sm font-medium">{team.name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
