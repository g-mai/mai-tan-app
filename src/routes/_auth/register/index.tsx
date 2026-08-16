import { createFileRoute, Link } from "@tanstack/react-router";
import { useRegisterEmail } from "#/features/auth/hooks/useRegisterEmail";

export const Route = createFileRoute("/_auth/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { form, isPending } = useRegisterEmail();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Enter your email and we'll send you a 6-digit code to confirm it.
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
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Sending code..." : "Send code"}
            />
          </form.AppForm>
        </form>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
          We only use your email for account and transactional messages — never
          marketing. You can permanently delete your account and all its data
          from Settings at any time.
        </p>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
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
