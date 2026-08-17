import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  ScreenBody,
  ScreenCard,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { useSetInitialPassword } from "#/features/auth/hooks/useSetInitialPassword";

export const Route = createFileRoute("/_auth/register/password")({
  beforeLoad: ({ context }) => {
    // Verifying the code creates the session, so reaching this route without
    // one means the flow was never started.
    if (!context.session) {
      throw redirect({ to: "/register" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { form, isPending } = useSetInitialPassword();

  return (
    <ScreenCard>
      <ScreenStrip
        path="/register/password"
        state="email confirmed"
        tone="primary"
      />
      <ScreenBody>
        <ScreenHeader
          title="Choose a password"
          description="Your email is confirmed. Set a password to finish securing your account."
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
              <field.PasswordField label="Password" placeholder="***" />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField label="Confirm Password" placeholder="***" />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Saving..." : "Continue"}
            />
          </form.AppForm>
        </form>
      </ScreenBody>
    </ScreenCard>
  );
}
