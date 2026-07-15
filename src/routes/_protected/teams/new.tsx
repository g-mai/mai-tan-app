import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { CreateTeam } from "#/features/organizations/components/create-team";
import { listOrganizations } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/teams/new")({
  component: RouteComponent,
  loader: async () => {
    const orgs = await listOrganizations();
    return orgs ?? [];
  },
});

function RouteComponent() {
  const organizations = Route.useLoaderData();

  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle
        title="Create Team"
        subtitle="Create a new team inside one of your organizations"
      />
      {organizations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You need an organization first.{" "}
          <Link to="/organizations/new" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <CreateTeam organizations={organizations} />
      )}
    </div>
  );
}
