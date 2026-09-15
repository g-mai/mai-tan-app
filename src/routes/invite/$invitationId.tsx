import { createFileRoute } from "@tanstack/react-router";
import { getSession } from "#/features/auth/lib/auth.functions";
import { InviteAcceptScreen } from "#/features/organizations/components/invite-accept-screen";
import { InviteInvalidScreen } from "#/features/organizations/components/invite-invalid-screen";
import { InviteSignedOutScreen } from "#/features/organizations/components/invite-signed-out-screen";
import { InviteWrongUserScreen } from "#/features/organizations/components/invite-wrong-user-screen";
import { getInvitationPreview } from "#/features/organizations/lib/invitation.functions";

export const Route = createFileRoute("/invite/$invitationId")({
  loader: async ({ params }) => {
    const [invitation, session] = await Promise.all([
      getInvitationPreview({ data: { id: params.invitationId } }),
      getSession(),
    ]);

    return { invitation, session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invitation, session } = Route.useLoaderData();
  const { invitationId } = Route.useParams();

  if (invitation.status === "invalid") {
    return <InviteInvalidScreen />;
  }

  if (!session) {
    return (
      <InviteSignedOutScreen
        invitation={invitation}
        invitationId={invitationId}
      />
    );
  }

  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <InviteWrongUserScreen
        invitedEmail={invitation.email}
        signedInEmail={session.user.email}
      />
    );
  }

  return (
    <InviteAcceptScreen
      invitation={invitation}
      invitationId={invitationId}
      user={session.user}
    />
  );
}
