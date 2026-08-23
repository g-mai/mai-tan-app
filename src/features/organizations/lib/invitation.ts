export type InvitationPreview =
  | {
      status: "pending";
      organizationName: string;
      inviterName: string;
      email: string;
    }
  | { status: "invalid" };

type InvitationRow = {
  email: string;
  status: string;
  expiresAt: Date;
  organization: { name: string };
  user: { name: string | null; email: string };
};

/**
 * What the public invite page is allowed to know.
 *
 * Every failure collapses into one detail-free "invalid": anything that
 * distinguishes missing from expired from already-used turns the endpoint into
 * an existence oracle for invitation ids, and tells the recipient nothing they
 * can act on — the answer is "ask for a new invite" either way.
 */
export function toInvitationPreview(
  invitation: InvitationRow | null | undefined,
  now = new Date(),
): InvitationPreview {
  if (invitation?.status !== "pending" || invitation.expiresAt < now) {
    return { status: "invalid" };
  }

  return {
    status: "pending",
    organizationName: invitation.organization.name,
    inviterName: invitation.user.name || invitation.user.email,
    email: invitation.email,
  };
}
