import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Wip } from "#/components/shared/wip";
import { OrgCard } from "#/features/organizations/components/org-card";

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
      <Wip />
      {session.orgs.map((org) => (
        <OrgCard key={org.id} org={org} />
      ))}
    </div>
  );
}
