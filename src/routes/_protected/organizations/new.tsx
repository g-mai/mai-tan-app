import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle } from "#/components/shared/page-title";
import { CreateOrg } from "#/features/organizations/components/create-org";
import { EditOrg } from "#/features/organizations/components/edit-org";
import type { CreatedOrganization } from "#/features/organizations/hooks/useCreateOrg";

export const Route = createFileRoute("/_protected/organizations/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const [org, setOrg] = useState<CreatedOrganization | null>(null);

  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle
        title="Create Organization"
        subtitle="Create a new organization to manage your projects and teams"
      />
      {org ? (
        <EditOrg org={org} setOrg={setOrg} />
      ) : (
        <CreateOrg onCreated={setOrg} />
      )}
    </div>
  );
}
