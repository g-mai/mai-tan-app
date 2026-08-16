import { createFileRoute, redirect } from "@tanstack/react-router";
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
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Choose a password
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Your email is confirmed. Set a password to finish securing your
          account.
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
      </div>
    </div>
  );
}
