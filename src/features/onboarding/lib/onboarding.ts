import { type LinkProps, redirect } from "@tanstack/react-router";

export const ONBOARDING_STEPS = [
  "password",
  "profile",
  "organization",
  "subscription",
  "team",
  "invite",
  "complete",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_ROUTES: Record<OnboardingStep, LinkProps["to"]> = {
  password: "/register/password",
  profile: "/onboarding/profile",
  organization: "/onboarding/organization",
  subscription: "/onboarding/subscription",
  team: "/onboarding/team",
  invite: "/onboarding/invite",
  complete: "/onboarding/complete",
};

type OnboardingUser = { onboardingStep?: string | null };

type OnboardingContext = {
  context: { session: { user: OnboardingUser } | null | undefined };
  location: { pathname: string };
};

/**
 * `null` means onboarding is finished. That covers "done", the "" column
 * default every existing user has, and any unrecognized value — the field is
 * client-settable, so the gate fails open rather than stranding someone on a
 * step that doesn't exist.
 */
export function getOnboardingStep(
  user: OnboardingUser | null | undefined,
): OnboardingStep | null {
  const step = user?.onboardingStep;

  return ONBOARDING_STEPS.includes(step as OnboardingStep)
    ? (step as OnboardingStep)
    : null;
}

/** Sends a user with onboarding still in progress back to their current step. */
export function ensureOnboardingComplete(ctx: OnboardingContext) {
  const step = getOnboardingStep(ctx.context.session?.user);
  if (!step) return;

  const route = ONBOARDING_ROUTES[step];
  if (ctx.location.pathname !== route) {
    throw redirect({ to: route });
  }
}

/**
 * Guards a single onboarding route: reaching it out of order, or after
 * finishing, redirects to wherever the user actually belongs.
 */
export function ensureOnboardingStep(
  user: OnboardingUser | null | undefined,
  step: OnboardingStep,
) {
  const current = getOnboardingStep(user);

  if (!current) {
    throw redirect({ to: "/dashboard" });
  }

  if (current !== step) {
    throw redirect({ to: ONBOARDING_ROUTES[current] });
  }
}
