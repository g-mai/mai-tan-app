import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
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
      <ScreenCard>
        <ScreenStrip path="/forgot-password" state="sent" tone="primary" />
        <ScreenBody>
          <ScreenHeader
            icon={<Mail className="size-5" />}
            title="Password Reset Email Sent"
            description="We've sent you an email with instructions to reset your password. Please check your inbox and follow the instructions."
          />

          <Button variant="outline" className="mt-6" onClick={handleReset}>
            Send again
          </Button>
        </ScreenBody>
      </ScreenCard>
    );
  }

  return (
    <ScreenCard>
      <ScreenStrip path="/forgot-password" state="recovery" />
      <ScreenBody>
        <ScreenHeader
          title="Forgot your password?"
          description="Enter your email address below and we'll send you a link to reset your password."
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-6 grid gap-4"
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
      </ScreenBody>
      <ScreenFooter>
        <span>Don't have an account?</span>
        <Link
          to="/register"
          className="text-primary underline underline-offset-4"
        >
          Register
        </Link>
      </ScreenFooter>
    </ScreenCard>
  );
}
