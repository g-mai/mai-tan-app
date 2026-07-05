import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "#/components/shared/coming-soon";
import { PageTitle } from "#/components/shared/page-title";

export const Route = createFileRoute("/_protected/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageTitle
        title="Teams"
        subtitle="A unified view of every team you belong to, across all your organizations."
      />
      <ComingSoon
        title="Team listing"
        description="For now, view and manage teams from within each organization's detail page."
      />
    </div>
  );
}
