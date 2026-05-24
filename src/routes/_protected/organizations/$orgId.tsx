import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { getOrganization } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/organizations/$orgId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const org = await getOrganization({ data: { id: params.orgId } });
    return org;
  },
  errorComponent: (props) => {
    return (
      <div>
        <PageTitle title={"Organization not found"} />
        <p>Error loading organization.</p>
        {props.error instanceof Error && <p>{props.error.message}</p>}
      </div>
    );
  },
});

function RoleBadge({ role }: { role: string }) {
  const colours: Record<string, string> = {
    owner: "bg-amber-100 text-amber-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-gray-100 text-gray-700",
  };
  const cls = colours[role] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {role}
    </span>
  );
}

function RouteComponent() {
  const org = Route.useLoaderData();

  const createdAt = new Date(org.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageTitle title={org.name} />

      {/* Overview card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <OrganizationLogo logoUrl={org.logo} width={64} height={64} />
            <div>
              <CardTitle className="text-2xl">{org.name}</CardTitle>
              <CardDescription className="mt-1">
                <span className="font-mono">/{org.slug}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>
              {org.members.length} member{org.members.length !== 1 ? "s" : ""}
            </span>
            <span>
              {org.teams.length} team{org.teams.length !== 1 ? "s" : ""}
            </span>
            <span>Created {createdAt}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>{org.members.length} total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {org.members.map((member, i) => (
                <li key={member.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>{org.teams.length} total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {org.teams.map((team, i) => (
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
      </div>
    </div>
  );
}
