import { useUpdateProfile } from "#/hooks/auth/useUpdateProfile";
import type { User } from "#/types/auth-types";
import { Card, CardHeader, CardTitle, CardContent } from "#/components/ui/card";
import { UserAvatar } from "./user-avatar";
import { Button } from "../ui/button";

export function ProfileSection({ user }: { user: User }) {
  const { form, isPending, isSuccess, isError } = useUpdateProfile({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  // TODO: finish this!

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 space-y-6">
          <div className="mb-0 flex min-w-35 flex-col items-center gap-4">
            <UserAvatar user={{ ...user }} height={80} width={80} />
            <Button variant="secondary">Upload WIP</Button>
            {/*<ImageUpload
              onUploadComplete={handleImageUpload}
              accept="image/*"
            />*/}
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
