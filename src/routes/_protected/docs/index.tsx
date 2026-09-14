import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Button } from "#/components/ui/button";
import { FeaturesCard } from "#/features/docs/components/features-card";
import { WhatThisIsCard } from "#/features/docs/components/what-this-is-card";

export const Route = createFileRoute("/_protected/docs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Introduction"
        subtitle="What Mai Tan App is and what's included."
      />

      <WhatThisIsCard />
      <FeaturesCard />

      <Button variant="outline" className="self-start" asChild>
        <Link to="/docs/get-started">Get started</Link>
      </Button>
    </div>
  );
}
