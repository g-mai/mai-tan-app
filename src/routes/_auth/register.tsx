import { createFileRoute, Link } from "@tanstack/react-router";
import { useRegister } from "#/features/auth/hooks/useRegister";
import { DemoButton } from "#/features/demo/components/demo-button";

export const Route = createFileRoute("/_auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const { form, isPending, isSuccess, isError } = useRegister();

  if (isSuccess) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-md p-6">
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            Account Created Successfully
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
            Check your email for a verification link to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <DemoButton />
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          A demo account will be created for you, and you can explore the app
          without signing up.
        </p>
        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

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
          <div className="flex gap-2">
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
          </div>
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="Email" placeholder="john@email.com" />
            )}
          </form.AppField>
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
              label={isPending ? "Loading..." : "Register"}
            />
          </form.AppForm>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-sm text-primary-500 dark:text-primary-400 underline hover:text-primary"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
