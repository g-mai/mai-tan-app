import { createFileRoute } from "@tanstack/react-router";
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
    <div className="p-2">
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Add a team
      </h1>
      <div className="text-sm text-muted-foreground mt-2 mb-6 grid gap-2">
        <p>
          Creating your organization also created a default team named after it,
          so you already have one.
        </p>
        <p>
          Teams scope people and work inside an organization — use them for
          departments, projects, or clients. Add a second one now, or skip and
          do it later.
        </p>
      </div>

      <CreateTeam organizations={session.orgs} />

      <Button
        variant="outline"
        className="mt-6"
        disabled={isPending}
        onClick={() => advance({ onboardingStep: "invite" })}
      >
        {isPending ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
