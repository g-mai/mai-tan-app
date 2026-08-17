import { createFileRoute } from "@tanstack/react-router";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { CreateTeam } from "#/features/organizations/components/create-team";

export const Route = createFileRoute("/onboarding/team")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "team"),
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useRouteContext();
  const { advance, isPending } = useAdvanceOnboarding();

  // TODO: refine the UI for create team step,
  // by including a list of the teams of the organization,
  // that refreshes on creation, and reset the form on success

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/team" state="step 5 / 7 · optional" />
      <ScreenBody>
        <ScreenHeader title="Add a team">
          <p>
            Creating your organization also created a default team named after
            it, so you already have one.
          </p>
          <p>
            Teams scope people and work inside an organization — use them for
            departments, projects, or clients. Add a second one now, or skip and
            do it later.
          </p>
        </ScreenHeader>

        <div className="mt-6">
          <CreateTeam variant="panel" organizations={session.orgs} />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <span className="font-mono text-[11px]">you can do this later</span>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => advance({ onboardingStep: "invite" })}
        >
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </ScreenFooter>
    </ScreenCard>
  );
}
