import { ImageUpload } from "#/components/shared/image-upload";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useUpdateProfile } from "#/features/auth/hooks/useUpdateProfile";
import { updateUser } from "#/features/auth/lib/auth-client";
import type { User } from "#/features/auth/types";
import { UserAvatar } from "./user-avatar";

export function ProfileSection({ user }: { user: User }) {
  const { form, isPending, isSuccess, isError } = useUpdateProfile({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  // TODO: finish this!
  async function handleImageUpload(url: string) {
    console.log("New image URL:", url);
    const { data, error } = await updateUser({ image: url });
    if (error) {
      console.error("Failed to update user image:", error);
      alert("Failed to update profile image. Please try again.");
    } else {
      console.log("User image updated successfully:", data);
      // Optionally show a success message or update local state
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 space-y-6">
          <div className="mb-0 flex min-w-35 flex-col items-center gap-4">
            <UserAvatar user={{ ...user }} height={120} width={120} />
            {/* <Button variant="secondary">Upload WIP</Button> */}
            <ImageUpload
              currentImageUrl={user.image}
              prefix="avatars"
              entityId={user.id}
              onUploadComplete={handleImageUpload}
              size={120}
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
              <form.AppField name="firstName">
                {(field) => (
                  <field.TextField label="First Name" placeholder="John" />
                )}
              </form.AppField>
              <form.AppField name="lastName">
                {(field) => (
                  <field.TextField label="Last Name" placeholder="Smith" />
                )}
              </form.AppField>

              <form.AppForm>
                <form.SubscribeButton
                  label={isPending ? "Updating..." : "Update"}
                />
              </form.AppForm>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
