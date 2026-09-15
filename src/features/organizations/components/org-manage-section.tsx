import { InviteMember } from "#/features/organizations/components/invite-member";
import { PendingInvitations } from "#/features/organizations/components/pending-invitations";
import { canManage, findMemberRole } from "#/features/organizations/lib/org";

type Org = {
  id: string;
  members: { userId: string; role: string | null }[];
  invitations: {
    id: string;
    email: string;
    role?: string | null;
    status: string;
    expiresAt: Date | string;
  }[];
};

/** Invite and pending-invite controls, shown only to owners and admins. */
export function OrgManageSection({
  org,
  currentUserId,
}: {
  org: Org;
  currentUserId: string;
}) {
  if (!canManage(findMemberRole(org.members, currentUserId))) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <InviteMember organizationId={org.id} />
      <PendingInvitations
        invitations={org.invitations}
        organizationId={org.id}
        className="bg-white height-full"
      />
    </div>
  );
}
