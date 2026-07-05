import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/stack/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_protected/tech/"!</div>;
}
