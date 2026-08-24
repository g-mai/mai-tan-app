import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { useLogin } from "#/features/auth/hooks/useLogin";

// Signed-in visitors are redirected by the _auth layout's onboarding gate.
export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    invitation: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { invitation } = Route.useSearch();
  const { form, isPending, isSuccess, isError } = useLogin({ invitation });

  return (
    <ScreenCard>
      <ScreenStrip path="/login" state="session" />
      <ScreenBody>
        <ScreenHeader
          title="Sign in to your account"
          description="Enter your email and password to login to your account"
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
              <field.TextField label="Email" placeholder="john@email.com" />
            )}
          </form.AppField>
          <div className="grid gap-1.5">
            <form.AppField name="password">
              {(field) => (
                <field.PasswordField label="Password" placeholder="***" />
              )}
            </form.AppField>
            <Link
              to="/forgot-password"
              className="justify-self-end text-xs text-primary underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
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
