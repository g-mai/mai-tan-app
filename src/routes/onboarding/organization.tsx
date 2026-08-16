import { createFileRoute } from "@tanstack/react-router";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { CreateOrg } from "#/features/organizations/components/create-org";

export const Route = createFileRoute("/onboarding/organization")({
  beforeLoad: ({ context }) =>
    ensureOnboardingStep(context.user, "organization"),
  component: RouteComponent,
});

function RouteComponent() {
  const { advance } = useAdvanceOnboarding();

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
