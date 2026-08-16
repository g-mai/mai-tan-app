import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import z from "zod";
import { Button } from "#/components/ui/button";
import { FieldError } from "#/components/ui/field";
import { useVerifyEmailOtp } from "#/features/auth/hooks/useVerifyEmailOtp";

export const Route = createFileRoute("/_auth/register/verify")({
  validateSearch: z.object({
    email: z.email().catch(""),
  }),
  beforeLoad: ({ search }) => {
    if (!search.email) {
      throw redirect({ to: "/register" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useSearch();
  const { form, isPending, error, needsNewCode, resend, isResending } =
    useVerifyEmailOtp(email);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 10
          minutes.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          <form.AppField name="otp">
            {(field) => <field.TextField label="Code" placeholder="123456" />}
          </form.AppField>
          {error && <FieldError errors={[{ message: error }]} />}
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Verifying..." : "Verify"}
            />
          </form.AppForm>
        </form>

        <div className="mt-6 flex items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {needsNewCode ? "Need a new code?" : "Didn't get the email?"}
          </span>
          <Button
            variant="link"
            className="h-auto p-0"
            disabled={isResending}
            onClick={() => resend()}
          >
            {isResending ? "Sending..." : "Resend code"}
          </Button>
        </div>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          Wrong address?{" "}
          <Link
            to="/register"
            className="text-sm text-primary-500 dark:text-primary-400 underline hover:text-primary"
          >
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}
