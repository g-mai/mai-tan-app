import { createFileRoute } from "@tanstack/react-router";
import { EditOrg } from "#/features/organizations/components/edit-org";
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
  const setOrg = () => {};

  console.log(org);
  return <EditOrg org={org} setOrg={setOrg} />;
}
