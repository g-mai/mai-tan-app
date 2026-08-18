import { ArrowLeft } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import type { OnboardingStep } from "#/features/onboarding/lib/onboarding";

/**
 * Going back is the same write as going forward — the step has to be persisted,
 * or the route gate sends the user straight back to where they were.
 */
export function OnboardingBackButton({
  step,
  disabled,
}: {
  step: OnboardingStep;
  disabled?: boolean;
}) {
  const { navigate, isPending } = useOnboardingNavigation();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled || isPending}
      onClick={() => navigate({ onboardingStep: step })}
    >
      <ArrowLeft className="size-4" />
      {isPending ? "Going back..." : "Back"}
    </Button>
  );
}
