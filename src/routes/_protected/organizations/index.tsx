import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";

export const Route = createFileRoute("/_protected/organizations/")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useRouteContext();

  if (!session.orgs || session.orgs.length === 0) {
    return <p>Nothing found</p>;
  }

  // TODO: add a button to create a new organization
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Organizations"
        subtitle="View and manage your organizations"
      />
      {session.orgs.map((org) => (
        <Link
          to="/organizations/$orgId"
          params={{ orgId: org.id }}
          key={org.id}
        >
          <Card className="min-w-sm cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-4">
                <OrganizationLogo logoUrl={org.logo} height={48} width={48} />
                <CardTitle>{org.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {org.description || "No description"}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
