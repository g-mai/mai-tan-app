import { createFileRoute } from "@tanstack/react-router";
import { useRegister } from "#/hooks/useRegister";

export const Route = createFileRoute("/_auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const { form, isPending, isSuccess, isError } = useRegister();

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Enter your email and password to create your account
        </p>

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
              <field.TextField
                label="First Name"
                placeholder="Enter your first name"
              />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.TextField
                label="Last Name"
                placeholder="Enter your last name"
              />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="Email" placeholder="Enter your email" />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                label="Password"
                placeholder="Enter your password"
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                label="Confirm Password"
                placeholder="Confirm your password"
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Loading..." : "Register"}
            />
          </form.AppForm>
        </form>
      </div>
    </div>
  );
}
