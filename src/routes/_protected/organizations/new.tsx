// CREATE NEW ORGANIZATION PAGE
import { ComingSoon } from "#/components/shared/coming-soon";
import { PageTitle } from "#/components/shared/page-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/organizations/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle
        title="Create Orgnization"
        subtitle="Create a new organization to manage your projects and teams"
      />
      <ComingSoon
        title="Create organization form"
        description="Form to create a new organization is on its way."
      />
    </div>
  );
}
