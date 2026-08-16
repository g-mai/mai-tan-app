import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { updateUser } from "#/features/auth/lib/auth-client";
import {
  ONBOARDING_ROUTES,
  type OnboardingStep,
} from "#/features/onboarding/lib/onboarding";

type OnboardingUserUpdate = {
  /** "done" finishes onboarding and hands the user to the app. */
  onboardingStep: OnboardingStep | "done";
  firstName?: string;
  lastName?: string;
  name?: string;
  favouriteOrganization?: string;
};

/**
 * Moves the user to the next step. Always via `updateUser`, never a direct DB
 * write: the session cookie cache would otherwise serve a stale step for up to
 * 5 minutes and the gate would bounce the user backwards.
 */
export function useAdvanceOnboarding() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (update: OnboardingUserUpdate) => {
      const { error } = await updateUser(update);
      if (error) throw error;
    },
    onSuccess: async (_data, update) => {
      await router.invalidate();
      router.navigate({
        to:
          update.onboardingStep === "done"
            ? "/dashboard"
            : ONBOARDING_ROUTES[update.onboardingStep],
      });
    },
    onError: (error) => {
      console.error("Onboarding step error:", error);
      toast.error(error.message || "Could not save your progress.", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  return { advance: mutate, isPending };
}
