import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";
import { auth } from "#/features/auth/lib/auth";
import type {
  BatchResult,
  MemberRow,
} from "#/features/organizations/lib/member-management";
import { db } from "#/lib/db";

export async function organizationRoster(organizationId: string) {
  const { members, total } = await auth.api.listMembers({
    headers: getRequestHeaders(),
    query: { organizationId, limit: 100, offset: 0 },
  });
  const rows: MemberRow[] = members.map((member) => ({
    memberId: member.id,
    userId: member.userId,
    role: member.role,
    name: member.user.name?.trim() || member.user.email,
    email: member.user.email,
    image: member.user.image ?? null,
  }));
  return { rows, total };
}

export async function organizationContext(
  organizationId: string,
  userId: string,
) {
  const { role } = await auth.api.getActiveMemberRole({
    headers: getRequestHeaders(),
    query: { organizationId },
  });
  const organization = await db.query.organization.findFirst({
    where: (org, { eq }) => eq(org.id, organizationId),
  });
  if (!organization) throw new Error("Organization not found");
  return { ...organization, role, userId };
}

/** Resolves scope only; the following Better Auth endpoint authorizes access. */
export async function resolveTeam(teamId: string) {
  const team = await db.query.team.findFirst({
    where: (team, { eq }) => eq(team.id, teamId),
  });
  if (!team) throw new Error("Team not found");
  return team;
}

export async function teamRoster(teamId: string, organizationId: string) {
  const members = await auth.api.listTeamMembers({
    headers: getRequestHeaders(),
    query: { teamId },
  });
  const { rows } = await organizationRoster(organizationId);
  const teamUserIds = new Set(members.map((member) => member.userId));
  return {
    rows: rows.filter((row) => teamUserIds.has(row.userId)),
    candidates: rows.filter((row) => !teamUserIds.has(row.userId)),
  };
}

/** Reused by the three batch endpoints; writes remain sequential and authoritative. */
export async function membershipBatch(
  userIds: string[],
  write: (userId: string) => Promise<string | undefined>,
  options: { removingFromTeam?: boolean; removedCallerId?: string } = {},
): Promise<BatchResult> {
  const result: BatchResult = { succeeded: [], skipped: [], failed: [] };
  let stopped: { code: string; message: string } | undefined;
  for (const userId of userIds) {
    if (stopped) {
      result.failed.push({ userId, ...stopped });
      continue;
    }
    try {
      const skip = await write(userId);
      if (skip) result.skipped.push({ userId, reason: skip });
      else {
        result.succeeded.push(userId);
        if (userId === options.removedCallerId)
          stopped = {
            code: "CALLER_REMOVED",
            message:
              "Your organization membership was removed. No further removals were attempted.",
          };
      }
    } catch (error) {
      const code =
        error instanceof APIError
          ? (error.body?.code ?? "API_ERROR")
          : "INTERNAL_ERROR";
      const message =
        error instanceof APIError && error.statusCode < 500
          ? error.message
          : "Could not update this membership. Refresh before retrying.";
      if (
        options.removingFromTeam &&
        code === "USER_IS_NOT_A_MEMBER_OF_THE_TEAM"
      ) {
        result.skipped.push({
          userId,
          reason: "Already absent from this team.",
        });
        continue;
      }
      result.failed.push({ userId, code, message });
      if (
        error instanceof APIError &&
        (error.statusCode === 401 ||
          [
            "YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER",
            "YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER",
            "YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER",
            "YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION",
          ].includes(code))
      )
        stopped = { code, message };
    }
  }
  return result;
}
