import { Link } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { TeamLogo } from "#/features/organizations/components/team-logo";
import { canManage } from "#/features/organizations/lib/org";
import { formatDate } from "#/lib/format";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  color: string | null;
  description?: string | null;
  role: string | null;
  organizationId: string;
  organization: { name: string };
  createdAt: Date | string;
  teamMembers: unknown[];
};

export function TeamOverviewCard({ team }: { team: Team }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4 relative">
          <TeamLogo
            logoUrl={team.logo}
            name={team.name}
            color={team.color}
            size={64}
          />
          <div>
            <CardTitle className="text-2xl">{team.name}</CardTitle>
            <CardDescription className="mt-1">
              <Link
                to="/organizations/$orgId"
                params={{ orgId: team.organizationId }}
                className="hover:underline"
              >
                {team.organization.name}
              </Link>
            </CardDescription>
          </div>
          {canManage(team.role) && (
            <div className="absolute top-0 right-0">
              <Link
                to="/teams/$teamId/edit"
                params={{ teamId: team.id }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Edit size={20} className="text-muted-foreground" />
                Edit
              </Link>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {team.description || "No description"}
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>
            {team.teamMembers.length} member
            {team.teamMembers.length !== 1 ? "s" : ""}
          </span>
          <span>Created {formatDate(team.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
