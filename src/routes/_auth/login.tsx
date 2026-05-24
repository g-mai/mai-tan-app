import { createFileRoute, Link } from "@tanstack/react-router";
import { useLogin } from "#/features/auth/hooks/useLogin";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { form, isPending, isSuccess, isError } = useLogin();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Enter your email and password to login to your account
        </p>

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
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField label="Password" placeholder="***" />
            )}
          </form.AppField>

          <Link
            to="/forgot-password"
            className="-mt-2 w-full text-xs text-right text-blue-700 hover:underline dark:text-blue-400"
          >
            Forgot password?
          </Link>
          <form.AppForm>
            <form.SubscribeButton label={isPending ? "Loading..." : "Login"} />
          </form.AppForm>
        </form>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
