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
import { FieldGroup } from "#/components/ui/field";
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
      return true;
    } catch (error) {
      console.error("Failed to update team logo:", error);
      toast.error("Failed to update team logo. Please try again.", {
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
          <h2>Team profile</h2>
        </CardTitle>
        <CardDescription>
          Give your team a recognizable identity and describe what it works on.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col items-start gap-4">
          <h3 className="text-sm font-medium">Team logo</h3>
          <TeamLogo
            logoUrl={team.logo}
            name={team.name}
            color={team.color}
            size={80}
            className="rounded-xl"
          />
          <ImageUpload
            currentImageUrl={team.logo}
            prefix="teams"
            entityId={team.id}
            onUploadComplete={handleLogoUpload}
            buttonText="Upload logo"
          />
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Choose an image to help people recognize your team. Logo uploads are
            saved immediately.
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
              {(field) => (
                <field.ColorField
                  label="Color"
                  description="Used for the team icon when no logo is set."
                />
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
