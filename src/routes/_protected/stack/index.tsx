import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { StackHighlights } from "#/features/docs/components/stack-highlight-card";
import { StackListCard } from "#/features/docs/components/stack-list-card";

export const Route = createFileRoute("/_protected/stack/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Tech stack"
        subtitle="The tools and frameworks this starter kit is built on."
      />

      <StackHighlights />
      <StackListCard />
    </div>
  );
}
