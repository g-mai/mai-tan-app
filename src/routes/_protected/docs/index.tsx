import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/docs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/docs/"!</div>;
}
