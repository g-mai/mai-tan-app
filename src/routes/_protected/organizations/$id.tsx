import { PageTitle } from "#/components/shared/PageTitle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/organizations/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const orgId = Route.useParams().id;

  return (
    <div>
      <PageTitle title={"Org page"} />
      {orgId}
    </div>
  );
}
