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
import type { CreatedOrganization } from "#/features/organizations/hooks/useCreateOrg";
import { useUpdateOrg } from "#/features/organizations/hooks/useUpdateOrg";

export function EditOrg({
  org,
  setOrg,
}: {
  org: CreatedOrganization;
  setOrg: (org: CreatedOrganization) => void;
}) {
  const { form, isPending } = useUpdateOrg(org);

  async function handleLogoUpload(
    url: string | undefined,
    error: Error | null,
  ) {
    try {
      if (error) throw error;
      if (!url) throw new Error("No URL returned from upload");

      const { data, error: updateError } = await organization.update({
        organizationId: org.id,
        data: { logo: url },
      });

      if (updateError) {
        throw new Error(
          updateError.message || "Failed to update organization logo",
        );
      }
      if (!data) throw new Error("No organization returned from update");

      setOrg(data);
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
        <CardTitle>{org.name}</CardTitle>
        <CardDescription>
          Add a logo and some details. All of this is optional — you can skip it
          and edit later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="mb-0 flex min-w-35 flex-col items-center gap-4">
            <OrganizationLogo logoUrl={org.logo} width={120} height={120} />
            <ImageUpload
              currentImageUrl={org.logo}
              prefix="orgs"
              entityId={org.id}
              onUploadComplete={handleLogoUpload}
              buttonText="Upload Logo"
            />
          </div>

          <div className="flex-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="grid gap-4"
            >
              <form.AppField name="description">
                {(field) => (
                  <field.TextField
                    label="Description"
                    placeholder="What your organization does"
                  />
                )}
              </form.AppField>
              <form.AppField name="website">
                {(field) => (
                  <field.TextField
                    label="Website"
                    placeholder="https://acme.com"
                  />
                )}
              </form.AppField>
              <form.AppField name="address">
                {(field) => (
                  <field.TextField label="Address" placeholder="1 Main St" />
                )}
              </form.AppField>
              <div className="flex gap-2">
                <form.AppField name="postCode">
                  {(field) => (
                    <field.TextField label="Post Code" placeholder="SW1A 1AA" />
                  )}
                </form.AppField>
                <form.AppField name="country">
                  {(field) => (
                    <field.TextField label="Country" placeholder="UK" />
                  )}
                </form.AppField>
              </div>
              <form.AppField name="phone">
                {(field) => (
                  <field.TextField
                    label="Phone"
                    placeholder="+44 20 7123 4567"
                  />
                )}
              </form.AppField>

              <div className="flex items-center gap-2">
                <form.AppForm>
                  <form.SubscribeButton
                    label={isPending ? "Saving..." : "Save Changes"}
                  />
                </form.AppForm>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
