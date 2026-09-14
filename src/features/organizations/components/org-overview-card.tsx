import { Link, useRouter } from "@tanstack/react-router";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "#/components/shared/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { organization } from "#/features/auth/lib/auth-client";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { formatDate } from "#/lib/format";

type Org = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date | string;
  members: unknown[];
  teams: unknown[];
};

export function OrgOverviewCard({ org }: { org: Org }) {
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
          <span>Created {formatDate(org.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
