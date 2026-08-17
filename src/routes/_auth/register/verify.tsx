import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import z from "zod";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
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
    <ScreenCard>
      <ScreenStrip
        path="/register/verify"
        state={error ? "error" : "2 / 2"}
        tone={error ? "destructive" : "muted"}
      />
      <ScreenBody>
        <ScreenHeader
          title="Check your email"
          description={
            <>
              We sent a 6-digit code to{" "}
              <strong className="font-medium text-foreground">{email}</strong>.
              It expires in 10 minutes.
            </>
          }
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-6 grid gap-4"
        >
          {/* Code reads as a code: mono, tracked out, taller field. */}
          <div className="[&_input]:h-12 [&_input]:font-mono [&_input]:text-xl [&_input]:tracking-[0.4em]">
            <form.AppField name="otp">
              {(field) => <field.TextField label="Code" placeholder="123456" />}
            </form.AppField>
          </div>
          {error && <FieldError errors={[{ message: error }]} />}
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Verifying..." : "Verify"}
            />
          </form.AppForm>
        </form>

        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <span>
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
      </ScreenBody>
      <ScreenFooter>
        <span>Wrong address?</span>
        <Link
          to="/register"
          className="text-primary underline underline-offset-4"
        >
          Start over
        </Link>
      </ScreenFooter>
    </ScreenCard>
  );
}
