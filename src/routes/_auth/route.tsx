import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import { GridBackdrop } from "#/components/shared/screen-shell";
import Footer from "#/features/layout/components/footer";
import {
  ensureOnboardingComplete,
  getOnboardingStep,
} from "#/features/onboarding/lib/onboarding";

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

// The Card moved into each screen so strips/footers can differ per route.
function AuthLayout() {
  return (
    <GridBackdrop className="flex flex-col">
      <main className="flex flex-1 flex-col justify-center px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <LogoTitle
            href="/"
            className="mb-8 flex items-center justify-center gap-3"
          />
          <Outlet /> {/* child routes render here */}
        </div>
      </main>
      <Footer />
    </GridBackdrop>
  );
}
