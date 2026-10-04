import { createFileRoute } from "@tanstack/react-router";
import { Wip } from "#/components/shared/wip";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { DeleteOrganizationDialog } from "#/features/organizations/components/delete-organization-dialog";
import { EditOrg } from "#/features/organizations/components/edit-org";
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

  return (
    <div className="flex flex-col gap-4">
      <Wip />
      <EditOrg org={org} setOrg={setOrg} />
      {hasRole(findMemberRole(org.members, user.id), "owner") && (
        <>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Dangerous area</CardTitle>
              <CardDescription>
                Permanently deletes this organization, its teams, members, and
                invitations. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                disabled={deletion.isPending}
                onClick={deletion.open}
              >
                Delete organization
              </Button>
            </CardContent>
          </Card>
          <DeleteOrganizationDialog
            action={deletion}
            organizationName={org.name}
          />
        </>
      )}
    </div>
  );
}
