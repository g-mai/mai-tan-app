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
import { useChangeEmail } from "#/features/auth/hooks/useChangeEmail";
import type { User } from "#/features/auth/types";

export function ChangeEmailSection({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const { form, isPending, isSuccess, isError, reset } = useChangeEmail(
    user.email,
  );

  if (isSuccess && open) {
    setOpen(false);
    reset(); // to reset isSuccess state
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p>Change Email</p>
          <DialogTrigger asChild>
            <Button variant="secondary">{">"}</Button>
          </DialogTrigger>
        </div>

        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              We will email your current address for approval, then send a
              verification link to your new address.
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
            <form.AppField name="email">
              {(field) => (
                <field.TextField label="Email" placeholder="john@email.com" />
              )}
            </form.AppField>

            <form.AppForm>
              <form.SubscribeButton
                label={isPending ? "Sending..." : "Request email change"}
              />
            </form.AppForm>
          </form>
        </DialogContent>
      </div>
    </Dialog>
  );
}
