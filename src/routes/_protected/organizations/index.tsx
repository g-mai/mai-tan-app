import { createFileRoute, Link } from "@tanstack/react-router";
import { listOrganizations } from "#/lib/better-auth/org-functions";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { OrganizationLogo } from "#/components/shared/organization-logo";
import { PageTitle } from "#/components/shared/PageTitle";

export const Route = createFileRoute("/_protected/organizations/")({
  component: RouteComponent,
  loader: async () => {
    const orgs = await listOrganizations();
    return orgs;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  if (!data) {
    return <p>Nothing found</p>;
  }

  return (
    <div>
      <PageTitle
        title="Organizations"
        subtitle="View and manage your organizations"
      />
      {data.map((org) => (
        <Link to="/organizations/$id" params={{ id: org.id }} key={org.id}>
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
