import { createFileRoute, Link } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { PageTitle } from "#/components/shared/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { TeamLogo } from "#/features/organizations/components/team-logo";
import { getFullTeam } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/teams/$teamId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const team = await getFullTeam({ data: { id: params.teamId } });
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
  const canManage = team.role === "owner" || team.role === "admin";

  const createdAt = new Date(team.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageTitle title={team.name} />

      {/* Overview card */}
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
            {canManage && (
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
            <span>Created {createdAt}</span>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>{team.teamMembers.length} total</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {team.teamMembers.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              This team has no members yet.
            </p>
          ) : (
            <ul>
              {team.teamMembers.map((teamMember, i) => (
                <li key={teamMember.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {teamMember.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {teamMember.user.email}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
