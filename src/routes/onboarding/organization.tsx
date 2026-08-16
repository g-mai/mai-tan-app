import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
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
      <div className="p-2">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          You're in {org.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          You already belong to an organization, so there's nothing to set up
          here. You can always create your own later.
        </p>
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
      </div>
    );
  }

  if (invitations.length > 0) {
    return (
      <div className="p-2">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          You've been invited
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Join an organization you were invited to, or start your own instead.
        </p>

        <div className="grid gap-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle>{invitation.organizationName}</CardTitle>
                    <CardDescription className="mt-1">
                      as {invitation.role ?? "member"}
                    </CardDescription>
                  </div>
                  <Button
                    disabled={isAccepting}
                    onClick={() => accept(invitation.id)}
                  >
                    {isAccepting
                      ? "Joining..."
                      : `Join ${invitation.organizationName}`}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <CreateOrg
          onCreated={(org) =>
            advance({
              favouriteOrganization: org.id,
              onboardingStep: "subscription",
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="p-2">
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Create your organization
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        An organization is the top-level container for your people, teams and
        billing. You can create more later.
      </p>

      <CreateOrg
        onCreated={(org) =>
          advance({
            favouriteOrganization: org.id,
            onboardingStep: "subscription",
          })
        }
      />
    </div>
  );
}
