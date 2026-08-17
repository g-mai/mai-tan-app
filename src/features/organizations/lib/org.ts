type OrgMembership = { userId: string; role: string | null };

type OrgWithMembers = {
  id: string;
  name: string;
  members: OrgMembership[];
};

export type SoleOwnedOrg = {
  id: string;
  name: string;
  /** How many other people lose access if this organization is deleted. */
  otherMemberCount: number;
};

/** Better Auth stores roles comma-joined, e.g. "admin,sales". */
function isOwner(membership: OrgMembership) {
  return (membership.role ?? "").split(",").includes("owner");
}

/**
 * The organizations that would be left with no owner if this user disappeared.
 *
 * `organization` has no foreign key to `user` and the organization plugin has no
 * hook on user deletion, so an org whose only owner is deleted survives with
 * nobody able to reach it. This is the rule that decides which orgs get deleted
 * along with the account, and what the confirmation dialog warns about.
 */
export function findSoleOwnedOrgs(
  orgs: OrgWithMembers[],
  userId: string,
): SoleOwnedOrg[] {
  return orgs
    .filter((org) => {
      const owners = org.members.filter(isOwner);
      return owners.length === 1 && owners[0].userId === userId;
    })
    .map((org) => ({
      id: org.id,
      name: org.name,
      otherMemberCount: org.members.filter((m) => m.userId !== userId).length,
    }));
}
