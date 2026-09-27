import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Edit } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "#/components/shared/image-upload";
import { RouteError } from "#/components/shared/route-error";
import { Wip } from "#/components/shared/wip";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { organization } from "#/features/auth/lib/auth-client";
import { MemberList } from "#/features/organizations/components/member-list";
import { OrgTeamsCard } from "#/features/organizations/components/org-teams-card";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { getOrganizationOverview } from "#/features/organizations/lib/member-management.functions";

export const Route = createFileRoute("/_protected/organizations/$orgId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const org = await getOrganizationOverview({
      data: { organizationId: params.orgId },
    });
    return org;
  },
  errorComponent: ({ error }) => (
    <RouteError
      title="Organization not found"
      message="Error loading organization."
      error={error}
    />
  ),
});

function RouteComponent() {
  const org = Route.useLoaderData();
  const router = useRouter();

  async function handleImageUpload(
    url: string | undefined,
    error: Error | null,
  ) {
    try {
      if (error) throw error;
      if (!url) throw new Error("No URL returned from upload");
      const { error: updateError } = await organization.update({
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
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2.5 self-start"
        >
          <Link to="/organizations">
            <ArrowLeft data-icon="inline-start" />
            Back to all organizations
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <OrganizationLogo logoUrl={org.logo} width={64} height={64} />
              <ImageUpload
                currentImageUrl={org.logo}
                prefix="orgs"
                entityId={org.id}
                onUploadComplete={handleImageUpload}
                buttonText="Edit Logo"
              />
            </div>
            <div className="min-w-0">
              <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
                {org.name}
              </h1>
              <p className="mt-2 break-all text-sm text-muted-foreground">
                /{org.slug}
              </p>
              {org.description && (
                <p className="mt-3 max-w-3xl wrap-break-word text-sm leading-relaxed text-muted-foreground">
                  {org.description}
                </p>
              )}
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="self-start">
            <Link to="/organizations/$orgId/edit" params={{ orgId: org.id }}>
              <Edit data-icon="inline-start" />
              Edit organization
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <MemberList
          members={org.members.map((row) => ({
            id: row.memberId,
            role: row.role,
            user: row,
          }))}
          total={org.memberCount}
          organizationId={org.id}
        />
        <OrgTeamsCard teams={org.teams} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization subscription</CardTitle>
          <CardDescription>
            Plan and billing details for {org.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Wip description="Subscription management is under development and will be available here." />
        </CardContent>
      </Card>
    </div>
  );
}
