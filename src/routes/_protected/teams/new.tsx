import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "#/components/shared/coming-soon";
import { PageTitle } from "#/components/shared/page-title";

export const Route = createFileRoute("/_protected/teams/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageTitle title="Create team" />
      <ComingSoon
        title="Team creation"
        description="The ability to create a new team within an organization is on its way."
      />
    </div>
  );
}
