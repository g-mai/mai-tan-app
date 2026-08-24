import {
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "#/features/onboarding/lib/onboarding";
import { cn } from "#/lib/utils";

// The first step is registration itself — shown as already done, since the bar
// only renders inside /onboarding/* (i.e. from step 2 onward).
const LABELS: Record<OnboardingStep, string> = {
  password: "register",
  profile: "profile",
  organization: "org",
  subscription: "plan",
  team: "team",
  invite: "invite",
  complete: "done",
};

export function OnboardingProgress({ step }: { step: OnboardingStep }) {
  if (step === "password") return null;
  const current = ONBOARDING_STEPS.indexOf(step);

  return (
    <ol
      aria-label={`Step ${current + 1} of ${ONBOARDING_STEPS.length}`}
      className="flex w-full gap-1.5"
    >
      {ONBOARDING_STEPS.map((s, i) => (
        <li key={s} className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span
            aria-hidden
            className={cn(
              "h-1 rounded-full transition-colors duration-200 ease-in-out",
              i <= current ? "bg-primary" : "bg-border",
            )}
          />
          <span
            className={cn(
              "hidden truncate font-mono text-[10px] sm:block",
              i === current ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {LABELS[s]}
          </span>
        </li>
      ))}
    </ol>
  );
}
