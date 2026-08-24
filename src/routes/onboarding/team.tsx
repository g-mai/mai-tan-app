import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
  SectionPanel,
} from "#/components/shared/screen-shell";
import { Button } from "#/components/ui/button";
import { OnboardingBackButton } from "#/features/onboarding/components/onboarding-back-button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { CreateTeam } from "#/features/organizations/components/create-team";
import { TeamLogo } from "#/features/organizations/components/team-logo";
import { listTeams } from "#/features/organizations/lib/team.functions";

export const Route = createFileRoute("/onboarding/team")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "team"),
  loader: async () => {
    const teams = await listTeams();
    return teams;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useRouteContext();
  const teams = Route.useLoaderData();
  const router = useRouter();
  const { navigate, isPending } = useOnboardingNavigation();

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

        <div className="mt-6 grid gap-4">
          <CreateTeam
            variant="panel"
            organizations={session.orgs}
            onCreated={() => router.invalidate()}
          />

          {teams.length > 0 && (
            <SectionPanel title="Teams you already have">
              <ul className="grid gap-3">
                {teams.map((team) => (
                  <li key={team.id} className="flex items-center gap-3">
                    <TeamLogo
                      logoUrl={team.logo}
                      name={team.name}
                      color={team.color}
                      size={28}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {team.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {team.organization.name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionPanel>
          )}
        </div>
      </ScreenBody>
      <ScreenFooter>
        <OnboardingBackButton step="subscription" disabled={isPending} />
        <span className="font-mono text-[11px]">you can do this later</span>
        <Button
          // variant="outline"
          disabled={isPending}
          onClick={() => navigate({ onboardingStep: "invite" })}
        >
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </ScreenFooter>
    </ScreenCard>
  );
}
