import { toast } from "sonner";
import { ImageUpload } from "#/components/shared/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
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
      return true;
    } catch (error) {
      console.error("Failed to update organization logo:", error);
      toast.error("Failed to update organization logo. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
      return false;
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          <h2>Organization profile</h2>
        </CardTitle>
        <CardDescription>
          Add a logo and details for {org.name}. These details are optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col items-start gap-4">
          <h3 className="text-sm font-medium">Organization logo</h3>
          <OrganizationLogo
            logoUrl={org.logo}
            width={80}
            height={80}
            className="size-20 rounded-xl border bg-muted"
          />
          <ImageUpload
            currentImageUrl={org.logo}
            prefix="orgs"
            entityId={org.id}
            onUploadComplete={handleLogoUpload}
            buttonText="Upload logo"
          />
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Choose an image to help people recognize your organization. Logo
            uploads are saved immediately.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex min-w-0 flex-col gap-6"
        >
          <FieldGroup className="gap-4">
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
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <form.AppField name="postCode">
                {(field) => (
                  <field.TextField label="Post code" placeholder="SW1A 1AA" />
                )}
              </form.AppField>
              <form.AppField name="country">
                {(field) => (
                  <field.TextField label="Country" placeholder="UK" />
                )}
              </form.AppField>
            </FieldGroup>
            <form.AppField name="phone">
              {(field) => (
                <field.TextField label="Phone" placeholder="+44 20 7123 4567" />
              )}
            </form.AppField>
          </FieldGroup>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Save to apply your profile changes.
            </p>
            <form.AppForm>
              <form.SubscribeButton
                label={isPending ? "Saving..." : "Save changes"}
              />
            </form.AppForm>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
