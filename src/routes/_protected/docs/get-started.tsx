import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { EnvVarsCard } from "#/features/docs/components/env-vars-card";
import { InstallationCard } from "#/features/docs/components/installation-card";
import { PrerequisitesCard } from "#/features/docs/components/prerequisites-card";

export const Route = createFileRoute("/_protected/docs/get-started")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Get started"
        subtitle="Prerequisites, installation, and environment setup."
      />

      <PrerequisitesCard />
      <InstallationCard />
      <EnvVarsCard />
    </div>
  );
}
