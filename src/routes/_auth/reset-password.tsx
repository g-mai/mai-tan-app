import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { z } from "zod";
import {
  ScreenBody,
  ScreenCard,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { useResetPassword } from "#/features/auth/hooks/useResetPassword";

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
      <ScreenCard>
        <ScreenStrip
          path="/reset-password"
          state="token invalid"
          tone="destructive"
        />
        <ScreenBody>
          <ScreenHeader
            icon={<TriangleAlert className="size-5" />}
            title="Invalid Reset Link"
            description="This password reset link is invalid or has expired. Please request a new one."
          />
          <Button variant="outline" className="mt-6" asChild>
            <Link to="/forgot-password">Request new link</Link>
          </Button>
        </ScreenBody>
      </ScreenCard>
    );
  }

  return (
    <ScreenCard>
      <ScreenStrip path="/reset-password" state="token ok" />
      <ScreenBody>
        <ScreenHeader
          title="Reset your password"
          description="Enter your new password below."
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-6 grid gap-4"
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
      </ScreenBody>
    </ScreenCard>
  );
}
