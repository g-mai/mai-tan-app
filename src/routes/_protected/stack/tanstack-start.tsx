import { createFileRoute } from "@tanstack/react-router";
import { TechStackPage } from "#/components/shared/tech-stack-page";
import { STACK_DETAILS } from "#/features/docs/lib/stack";

export const Route = createFileRoute("/_protected/stack/tanstack-start")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TechStackPage {...STACK_DETAILS.tanstackStart} />;
}
