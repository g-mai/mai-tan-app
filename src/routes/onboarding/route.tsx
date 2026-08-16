import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import { ensureSession } from "#/features/auth/lib/auth.functions";
import Footer from "#/features/layout/components/footer";
import {
  getOnboardingStep,
  ONBOARDING_STEPS,
} from "#/features/onboarding/lib/onboarding";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);

    if (!getOnboardingStep(session.user)) {
      throw redirect({ to: "/dashboard" });
    }

    return session;
  },
  component: OnboardingLayout,
});

function OnboardingLayout() {
  const session = Route.useRouteContext();
  const step = getOnboardingStep(session.user);
  if (!step) {
    throw redirect({ to: "/dashboard" });
  }
  const stepNumber = ONBOARDING_STEPS.indexOf(step) + 1;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <LogoTitle href="/" className="flex gap-4 mx-auto" />
        {stepNumber > 0 && (
          <p className="mt-6 text-center font-mono text-muted-foreground text-xs">
            Step {stepNumber} of {ONBOARDING_STEPS.length}
          </p>
        )}
        <Card className="w-full max-w-xl mx-auto mt-4 mb-10 p-4">
          <Outlet />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
