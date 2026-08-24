import { createFileRoute } from "@tanstack/react-router";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
  SectionPanel,
} from "#/components/shared/screen-shell";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import { OnboardingBackButton } from "#/features/onboarding/components/onboarding-back-button";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { FakerMember } from "#/features/organizations/components/faker-member";
import { InviteMember } from "#/features/organizations/components/invite-member";
import { PendingInvitations } from "#/features/organizations/components/pending-invitations";
import { listOrgInvitations } from "#/features/organizations/lib/invitation.functions";
import { listOrgMembers } from "#/features/organizations/lib/org.functions";

export const Route = createFileRoute("/onboarding/invite")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "invite"),
  loader: async ({ context }) => {
    const organizationId = context.orgs[0]?.id;
    const [invitations, members] = await Promise.all([
      listOrgInvitations({ data: { organizationId } }),
      listOrgMembers({ data: { organizationId } }),
    ]);
    return { invitations, members };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invitations, members } = Route.useLoaderData();
  const session = Route.useRouteContext();
  const { navigate, isPending } = useOnboardingNavigation();
  const org = session.orgs[0];

  return (
    <ScreenCard>
      <ScreenStrip path="onboarding/invite" state="step 6 / 7" />
      <ScreenBody>
        <ScreenHeader title="Invite your teammates">
          <p>
            Invitations go out by email and stay pending until accepted, so you
            can send them before anyone has an account.
          </p>
          <p>
            <strong>Members</strong> can see the organization and the teams they
            belong to. <strong>Admins</strong> can additionally manage teams and
            invite or remove people. You're the <strong>owner</strong>, the only
            role that can delete the organization.
          </p>
        </ScreenHeader>

        <div className="mt-6 grid gap-4">
          <InviteMember variant="panel" organizationId={org.id} />
          <PendingInvitations
            variant="panel"
            invitations={invitations}
            organizationId={org.id}
          />

          {members.length > 0 && (
            <SectionPanel title="Members you already have">
              <ul className="grid gap-3">
                {members.map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <Avatar className="size-7">
                      <AvatarImage
                        src={member.user.image ?? undefined}
                        alt={`${member.user.name}'s avatar`}
                      />
                      <AvatarFallback className="text-xs">
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionPanel>
          )}
          {/* Dashed = optional escape hatch, not a primary path. */}
          <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              No one to invite yet?
            </span>
            <FakerMember organizationId={org.id} />
          </div>
        </div>
      </ScreenBody>
      <ScreenFooter>
        <OnboardingBackButton step="team" disabled={isPending} />
        <Button
          disabled={isPending}
          onClick={() => navigate({ onboardingStep: "complete" })}
        >
          {isPending ? "Saving..." : "Continue"}
        </Button>
      </ScreenFooter>
    </ScreenCard>
  );
}
