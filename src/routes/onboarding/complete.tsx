import { createFileRoute } from "@tanstack/react-router";
import { PartyPopper } from "lucide-react";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/onboarding/complete")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "complete"),
  component: RouteComponent,
});

const WHATS_NEXT = [
  "Create more organizations and switch between them any time.",
  "Add teams, edit their details, and manage who belongs to them.",
  "Invite people by email and pick the role they get.",
  "Update your profile, email and password in Settings — including permanently deleting your account and all its data.",
  "Browse the docs and the stack pages to see how it all fits.",
];

function RouteComponent() {
  const { navigate, isPending } = useOnboardingNavigation();

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/complete" state="exit 0" tone="primary" />
      <ScreenBody>
        <ScreenHeader
          icon={<PartyPopper className="size-5" />}
          title="You're all set"
          description="Everything below is waiting for you whenever you need it:"
        />

        {/* Same list, now numbered hairline rows instead of disc bullets. */}
        <ul className="mt-6 divide-y overflow-hidden rounded-lg border">
          {WHATS_NEXT.map((item, i) => (
            <li key={item} className="flex gap-3 px-4 py-3">
              <span className="font-mono text-sm leading-relaxed text-primary min-w-fit">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {item}
              </p>
            </li>
          ))}
        </ul>
      </ScreenBody>
      <ScreenFooter className="sm:justify-end">
        <Button
          disabled={isPending}
          onClick={() => navigate({ onboardingStep: "done" })}
        >
          {isPending ? "Saving..." : "Go to the app"}
        </Button>
      </ScreenFooter>
    </ScreenCard>
  );
}
