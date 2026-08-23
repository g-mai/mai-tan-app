import { describe, expect, it } from "vitest";
import {
  getOnboardingStep,
  ONBOARDING_ROUTES,
  ONBOARDING_STEPS,
} from "./onboarding";

describe("getOnboardingStep", () => {
  it.each(ONBOARDING_STEPS)("returns %s for a matching user", (step) => {
    expect(getOnboardingStep({ onboardingStep: step })).toBe(step);
  });

  it('returns null for "done"', () => {
    expect(getOnboardingStep({ onboardingStep: "done" })).toBeNull();
  });

  it('returns null for "" (the column default)', () => {
    expect(getOnboardingStep({ onboardingStep: "" })).toBeNull();
  });

  it("returns null for an unrecognized value", () => {
    expect(getOnboardingStep({ onboardingStep: "not-a-real-step" })).toBeNull();
  });

  it("returns null when there is no user", () => {
    expect(getOnboardingStep(null)).toBeNull();
  });
});

describe("ONBOARDING_ROUTES", () => {
  it("maps every step to its route", () => {
    expect(ONBOARDING_ROUTES).toEqual({
      password: "/register/password",
      profile: "/onboarding/profile",
      organization: "/onboarding/organization",
      subscription: "/onboarding/subscription",
      team: "/onboarding/team",
      invite: "/onboarding/invite",
      complete: "/onboarding/complete",
    });
  });
});
