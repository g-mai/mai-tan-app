import { useRouter } from "@tanstack/react-router";
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
import { TeamLogo } from "#/features/organizations/components/team-logo";
import {
  type EditableTeam,
  useUpdateTeam,
} from "#/features/organizations/hooks/useUpdateTeam";

export function EditTeam({ team }: { team: EditableTeam }) {
  const { form, isPending } = useUpdateTeam(team);
  const router = useRouter();

  async function handleLogoUpload(
    url: string | undefined,
    error: Error | null,
  ) {
    try {
      if (error) throw error;
      if (!url) throw new Error("No URL returned from upload");

      const { error: updateError } = await organization.updateTeam({
        teamId: team.id,
        data: { logo: url, organizationId: team.organizationId },
      });

      if (updateError) {
        throw new Error(updateError.message || "Failed to update team logo");
      }

      await router.invalidate();
      toast.success("Team logo updated successfully!", {
        duration: 5000,
        position: "top-center",
      });
    } catch (error) {
      console.error("Failed to update team logo:", error);
      toast.error("Failed to update team logo. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>
          Add a logo and some details. All of this is optional — you can skip it
          and edit later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="mb-0 flex min-w-35 flex-col items-center gap-4">
            <TeamLogo
              logoUrl={team.logo}
              name={team.name}
              color={team.color}
              size={120}
            />
            <ImageUpload
              currentImageUrl={team.logo}
              prefix="teams"
              entityId={team.id}
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
              <form.AppField name="name">
                {(field) => (
                  <field.TextField label="Name" placeholder="Design team" />
                )}
              </form.AppField>
              <form.AppField name="description">
                {(field) => (
                  <field.TextField
                    label="Description"
                    placeholder="What this team works on"
                  />
                )}
              </form.AppField>
              <form.AppField name="color">
                {(field) => <field.ColorField label="Color" />}
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
