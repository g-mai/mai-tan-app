import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { useForgotPassword } from "#/features/auth/hooks/useForgotPassword";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const { form, isPending, isSuccess, isError, handleReset } =
    useForgotPassword();

  if (isSuccess) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-md p-6">
          <h1 className="text-lg font-semibold leading-none tracking-tight">
            Password Reset Email Sent
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
            We've sent you an email with instructions to reset your password.
            Please check your inbox and follow the instructions.
          </p>

          <Button variant="outline" onClick={handleReset}>
            Send again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Enter your email address below and we'll send you a link to reset your
          password.
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
              <field.TextField label="Email" placeholder="Enter your email" />
            )}
          </form.AppField>

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
