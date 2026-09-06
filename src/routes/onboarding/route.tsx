import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import { GridBackdrop } from "#/components/shared/screen-shell";
import { ensureSession } from "#/features/auth/lib/auth.functions";
import Footer from "#/features/layout/components/footer";
import { OnboardingProgress } from "#/features/onboarding/components/onboarding-progress";
import { UserButton } from "#/features/onboarding/components/user-button";
import { getOnboardingStep } from "#/features/onboarding/lib/onboarding";

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

  return (
    <GridBackdrop className="flex flex-col">
      <main className="flex flex-1 flex-col justify-center px-4 py-10">
        <div className="mx-auto grid w-full max-w-xl gap-4">
          <div className="flex justify-between">
            <LogoTitle
              href="/"
              className="flex items-center justify-center gap-3"
            />
            <UserButton user={session.user} variant="onboarding" />
          </div>
          <OnboardingProgress step={step} />
          <Outlet />
        </div>
      </main>
      <Footer />
    </GridBackdrop>
  );
}
