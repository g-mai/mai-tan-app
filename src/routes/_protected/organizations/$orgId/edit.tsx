import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DangerAreaCard } from "#/components/shared/danger-area-card";
import { Button } from "#/components/ui/button";
import { DeleteOrganizationDialog } from "#/features/organizations/components/delete-organization-dialog";
import { EditOrg } from "#/features/organizations/components/edit-org";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import { useDeleteOrganization } from "#/features/organizations/hooks/useDeleteOrganization";
import { findMemberRole, hasRole } from "#/features/organizations/lib/org";
import { getOrganization } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/organizations/$orgId/edit")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const org = await getOrganization({ data: { id: params.orgId } });
    return org;
  },
});

function RouteComponent() {
  const org = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const deletion = useDeleteOrganization(org.id);
  const setOrg = () => {};
  const role = findMemberRole(org.members, user.id);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Edit organization
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Manage the profile and contact details for your organization.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium break-words">{org.name}</span>
            {role && <RoleBadge role={role} />}
          </div>
          <p className="truncate font-mono text-xs text-muted-foreground">
            /{org.slug}
          </p>
        </div>
        <Button asChild variant="outline" className="self-start lg:self-center">
          <Link to="/organizations/$orgId" params={{ orgId: org.id }}>
            <ArrowLeft data-icon="inline-start" />
            Back to organization
          </Link>
        </Button>
      </header>
      <EditOrg org={org} setOrg={setOrg} />
      {hasRole(role, "owner") && (
        <>
          <DangerAreaCard
            description="Permanently deletes this organization, its teams, members, and invitations. This cannot be undone."
            buttonLabel="Delete organization"
            disabled={deletion.isPending}
            onClick={deletion.open}
          />
          <DeleteOrganizationDialog
            action={deletion}
            organizationName={org.name}
          />
        </>
      )}
    </div>
  );
}
