// CREATE NEW ORGANIZATION PAGE
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/organizations/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const ctx = Route.useRouteContext();
  console.log(ctx);
  return <div>Hello "/_protected/organizations/new"!</div>;
}
