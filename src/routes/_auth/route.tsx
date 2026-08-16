import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import Footer from "#/features/layout/components/footer";
import {
  ensureOnboardingComplete,
  getOnboardingStep,
} from "#/features/onboarding/lib/onboarding";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_auth")({
  beforeLoad: (ctx) => {
    if (!ctx.context.session) return;

    // Signed in, so none of these pages apply — except /register/password,
    // which is itself the target for the "password" step.
    if (!getOnboardingStep(ctx.context.session.user)) {
      throw redirect({ to: "/dashboard" });
    }

    ensureOnboardingComplete(ctx);
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <LogoTitle href="/" className="flex gap-4 mx-auto" />
        <Card className="w-full max-w-md mx-auto mt-10 p-4">
          <Outlet /> {/* child routes render here */}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
