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
function rolesArray(role: string | null | undefined) {
  return (role ?? "").split(",");
}

function isOwner(membership: OrgMembership) {
  return rolesArray(membership.role).includes("owner");
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

/**
 * Which organization a session should point at, given the organizations the
 * user belongs to (longest-standing membership first).
 *
 * Keeps the one the session already has, as long as the user is still a member
 * — only a missing or stale id falls through to the first. Users who belong to
 * no organization at all are the one case that legitimately resolves to `null`.
 */
export function pickActiveOrganizationId(
  orgIds: string[],
  currentId?: string | null,
): string | null {
  if (currentId && orgIds.includes(currentId)) return currentId;

  return orgIds[0] ?? null;
}

/** The role this user holds in the organization, or `undefined` if not a member. */
export function findMemberRole(
  members: OrgMembership[],
  userId: string,
): string | undefined {
  return members.find((member) => member.userId === userId)?.role ?? undefined;
}

/**
 * Whether a role may administer the organization — invite and remove people,
 * manage teams, edit settings.
 *
 * Roles arrive comma-joined, so "admin,sales" manages exactly as "admin" does.
 */
export function canManage(role: string | null | undefined): boolean {
  const roles = rolesArray(role);

  return roles.includes("owner") || roles.includes("admin");
}
