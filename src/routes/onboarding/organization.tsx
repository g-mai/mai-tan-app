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
import { CreateOrg } from "#/features/organizations/components/create-org";
import { useAcceptInvitation } from "#/features/organizations/hooks/useAcceptInvitation";
import { listMyInvitations } from "#/features/organizations/lib/invitation.functions";

export const Route = createFileRoute("/onboarding/organization")({
  beforeLoad: ({ context }) =>
    ensureOnboardingStep(context.user, "organization"),
  loader: async () => listMyInvitations(),
  component: RouteComponent,
});

function RouteComponent() {
  const invitations = Route.useLoaderData();
  const session = Route.useRouteContext();
  const { advance, isPending } = useAdvanceOnboarding();

  // Accepting drops them at the end of the flow: the steps that follow
  // (subscription, team, invites) belong to whoever owns the organization.
  const { accept, isPending: isAccepting } = useAcceptInvitation({
    onAccepted: (accepted) =>
      advance({
        favouriteOrganization: accepted.invitation.organizationId,
        onboardingStep: "complete",
      }),
  });

  // Already joined one — through an invitation link, most likely.
  if (session.orgs.length > 0) {
    const org = session.orgs[0];
    return (
      <ScreenCard>
        <ScreenStrip
          path="onboarding/organization"
          state="already a member"
          tone="primary"
        />
        <ScreenBody>
          <ScreenHeader
            title={`You're in ${org.name}`}
            description="You already belong to an organization, so there's nothing to set up here. You can always create your own later."
          />
        </ScreenBody>
        <ScreenFooter className="sm:justify-end">
          <Button
            disabled={isPending}
            onClick={() =>
              advance({
                favouriteOrganization: org.id,
                onboardingStep: "complete",
              })
            }
          >
            {isPending ? "Saving..." : "Continue"}
          </Button>
        </ScreenFooter>
      </ScreenCard>
    );
  }

  if (invitations.length > 0) {
    return (
      <ScreenCard>
        <ScreenStrip
          path="onboarding/organization"
          state={`${invitations.length} invitation${invitations.length > 1 ? "s" : ""}`}
          tone="secondary"
        />
        <ScreenBody>
          <ScreenHeader
            title="You've been invited"
            description="Join an organization you were invited to, or start your own instead."
          />

          {/* Invitation rows: rust left rule instead of a nested Card. */}
          <div className="mt-6 grid gap-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-lg border border-l-[3px] border-l-secondary bg-muted p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {invitation.organizationName}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    as {invitation.role ?? "member"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0"
                  disabled={isAccepting}
                  onClick={() => accept(invitation.id)}
                >
                  {isAccepting
                    ? "Joining..."
                    : `Join ${invitation.organizationName}`}
                </Button>
              </div>
            ))}
          </div>

          <div className="my-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              OR
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <CreateOrg
            variant="panel"
            onCreated={(org) =>
              advance({
                favouriteOrganization: org.id,
                onboardingStep: "subscription",
              })
            }
          />
        </ScreenBody>
      </ScreenCard>
    );
  }

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/organization" state="step 3 / 7" />
      <ScreenBody>
        <ScreenHeader
          title="Create your organization"
          description="An organization is the top-level container for your people, teams and billing. You can create more later."
        />

        <div className="mt-6">
          <CreateOrg
            variant="panel"
            onCreated={(org) =>
              advance({
                favouriteOrganization: org.id,
                onboardingStep: "subscription",
              })
            }
          />
        </div>
      </ScreenBody>
    </ScreenCard>
  );
}
