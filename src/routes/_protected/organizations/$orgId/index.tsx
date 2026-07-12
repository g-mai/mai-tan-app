import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "#/components/shared/image-upload";
import { PageTitle } from "#/components/shared/page-title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { organization } from "#/features/auth/lib/auth-client";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { getOrganization } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/_protected/organizations/$orgId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const org = await getOrganization({ data: { id: params.orgId } });
    return org;
  },
  errorComponent: (props) => {
    return (
      <div>
        <PageTitle title={"Organization not found"} />
        <p>Error loading organization.</p>
        {props.error instanceof Error && <p>{props.error.message}</p>}
      </div>
    );
  },
});

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    owner: "bg-amber-100 text-amber-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-gray-100 text-gray-700",
  };
  const cls = colors[role] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {role}
    </span>
  );
}

function RouteComponent() {
  const org = Route.useLoaderData();
  const router = useRouter();

  const createdAt = new Date(org.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleImageUpload(
    url: string | undefined,
    error: Error | null,
  ) {
    try {
      if (error) throw error;
      if (!url) throw new Error("No URL returned from upload");
      const { data, error: updateError } = await organization.update({
        organizationId: org.id,
        data: {
          logo: url,
        },
      });

      if (updateError) {
        throw new Error(
          updateError.message || "Failed to update organization logo",
        );
      }

      // invalidate router data to update user object in session
      await router.invalidate();
      toast.success("Organization logo updated successfully!", {
        duration: 5000,
        position: "top-center",
      });
    } catch (error) {
      console.error("Failed to update organization logo:", error);
      toast.error("Failed to update organization logo. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle title={org.name} />

      {/* Overview card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 relative">
            <div className="flex flex-col items-center gap-2">
              <OrganizationLogo logoUrl={org.logo} width={64} height={64} />
              <ImageUpload
                currentImageUrl={org.logo}
                prefix="orgs"
                entityId={org.id}
                onUploadComplete={handleImageUpload}
                buttonText="Edit Logo"
              />
            </div>
            <div>
              <CardTitle className="text-2xl">{org.name}</CardTitle>
              <CardDescription className="mt-1">
                <span className="font-mono">/{org.slug}</span>
              </CardDescription>
            </div>
            <div className="absolute top-0 right-0">
              <Link
                to="/organizations/$orgId/edit"
                params={{ orgId: org.id }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Edit size={20} className="text-muted-foreground" />
                Edit
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>
              {org.members.length} member{org.members.length !== 1 ? "s" : ""}
            </span>
            <span>
              {org.teams.length} team{org.teams.length !== 1 ? "s" : ""}
            </span>
            <span>Created {createdAt}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>{org.members.length} total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {org.members.map((member, i) => (
                <li key={member.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>{org.teams.length} total</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {org.teams.map((team, i) => (
                <li key={team.id}>
                  <Link
                    to="/teams/$teamId"
                    params={{ teamId: team.id }}
                    className="block"
                  >
                    {i > 0 && <Separator />}
                    <div className="flex items-center justify-between px-6 py-3">
                      <p className="text-sm font-medium">{team.name}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
