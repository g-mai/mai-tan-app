import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { useResetPassword } from "#/hooks/useResetPassword";

const resetPasswordSearchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: resetPasswordSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useSearch({ from: "/_auth/reset-password" });
  const { form, isPending, isSuccess, isError, handleReset } =
    useResetPassword(token);

  if (!token) {
    return (
      <div className="flex justify-center py-10 px-4">
        <div className="w-full max-w-md p-6">
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            Invalid Reset Link
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Button variant="outline" asChild>
            <Link to="/forgot-password">Request new link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Enter your new password below.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                label="New Password"
                placeholder="Enter your new password"
              />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                label="Confirm Password"
                placeholder="Confirm your new password"
              />
            )}
          </form.AppField>

          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Loading..." : "Reset Password"}
            />
          </form.AppForm>
        </form>
      </div>
    </div>
  );
}
