import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { useChangePassword } from "#/features/auth/hooks/useChangePassword";

export function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const { form, isPending, isSuccess, reset } = useChangePassword();

  if (isSuccess && open) {
    setOpen(false);
    reset(); // to reset isSuccess state
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p>Change Password</p>
          <DialogTrigger asChild>
            <Button variant="secondary">{">"}</Button>
          </DialogTrigger>
        </div>

        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="grid gap-4"
          >
            <form.AppField name="currentPassword">
              {(field) => (
                <field.PasswordField
                  label="Current Password"
                  placeholder="***"
                />
              )}
            </form.AppField>

            <form.AppField name="newPassword">
              {(field) => (
                <field.PasswordField label="New Password" placeholder="***" />
              )}
            </form.AppField>

            <form.AppField name="confirmPassword">
              {(field) => (
                <field.PasswordField
                  label="Confirm New Password"
                  placeholder="***"
                />
              )}
            </form.AppField>

            <form.AppForm>
              <form.SubscribeButton
                label={isPending ? "Updating..." : "Update Password"}
              />
            </form.AppForm>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  );
}
