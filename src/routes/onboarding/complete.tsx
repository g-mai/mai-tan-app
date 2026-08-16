import { createFileRoute } from "@tanstack/react-router";
import { PartyPopper } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/onboarding/complete")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "complete"),
  component: RouteComponent,
});

function RouteComponent() {
  const { advance, isPending } = useAdvanceOnboarding();

  return (
    <div className="p-2">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <PartyPopper className="size-8" />
      </div>
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        You're all set
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        Everything below is waiting for you whenever you need it:
      </p>

      <ul className="grid gap-2 text-sm text-muted-foreground list-disc pl-5">
        <li>Create more organizations and switch between them any time.</li>
        <li>Add teams, edit their details, and manage who belongs to them.</li>
        <li>Invite people by email and pick the role they get.</li>
        <li>
          Update your profile, email and password in Settings — including
          permanently deleting your account and all its data.
        </li>
        <li>Browse the docs and the stack pages to see how it all fits.</li>
      </ul>

      <Button
        className="mt-6"
        disabled={isPending}
        onClick={() => advance({ onboardingStep: "done" })}
      >
        {isPending ? "Saving..." : "Go to the app"}
      </Button>
    </div>
  );
}
