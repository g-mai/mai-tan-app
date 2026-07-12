import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import type { SessionData, User } from "#/features/auth/types";
import { db } from "#/lib/db";

export const listOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const orgs = await auth.api.listOrganizations({
      headers: getRequestHeaders(),
    });
    return orgs;
  },
);

const getOrgSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  membersLimit: z.number().optional(),
});

export const getOrganization = createServerFn({ method: "GET" })
  .inputValidator(getOrgSchema)
  .handler(async ({ data }) => {
    const org = await auth.api.getFullOrganization({
      headers: getRequestHeaders(),
      query: {
        organizationId: data.id,
        organizationSlug: data.slug,
        membersLimit: data.membersLimit,
      },
    });
    if (!org) throw new Error("Organization not found");
    return org;
  });

const getTeamSchema = z.object({
  id: z.string(),
  session: z.custom<SessionData>().optional(),
  user: z.custom<User>().optional(),
});

export const getTeam = createServerFn({ method: "GET" })
  .inputValidator(getTeamSchema)
  .handler(async ({ data }) => {
    const teams = await auth.api.listUserTeams({
      headers: getRequestHeaders(),
    });
    const team = teams.find((t) => t.id === data.id);
    if (!team) throw new Error("Team not found");
    return team;
  });

const getFullTeamSchema = z.object({
  id: z.string(),
});

export const getFullTeam = createServerFn({ method: "GET" })
  .inputValidator(getFullTeamSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) throw new Error("Unauthorized");

    const teamData = await db.query.team.findFirst({
      where: (team, { eq }) => eq(team.id, data.id),
      with: {
        organization: true,
        teamMembers: {
          with: { user: true },
        },
      },
    });
    if (!teamData) throw new Error("Team not found");
    const orgMember = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.organizationId, teamData.organizationId),
          eq(member.userId, session.user.id),
        ),
    });
    if (!orgMember)
      throw new Error("User is not a member of this organization");

    return {
      ...teamData,
      role: orgMember.role,
    };
  });

export const listTeams = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session) throw new Error("Unauthorized");

  const memberships = await db.query.member.findMany({
    where: (member, { eq }) => eq(member.userId, session.user.id),
    columns: { organizationId: true },
  });
  if (memberships.length === 0) return [];

  // Scoped to org membership, not team membership: auth.api.listUserTeams only
  // returns teams with a teamMember row for the user, and createTeam doesn't add
  // the creator to the team — so a team you just made wouldn't show up here.
  return db.query.team.findMany({
    where: (team, { inArray }) =>
      inArray(
        team.organizationId,
        memberships.map((m) => m.organizationId),
      ),
    with: {
      organization: { columns: { name: true } },
    },
    orderBy: (team, { asc }) => asc(team.name),
  });
});

const getUserTeamsSchema = z.object({ organizationId: z.string() });

export const getUserTeams = createServerFn({ method: "GET" })
  .inputValidator(getUserTeamsSchema)
  .handler(async ({ data }) => {
    const teams = await auth.api.listUserTeams({
      headers: getRequestHeaders(),
      query: { organizationId: data.organizationId },
    });
    return teams ?? [];
  });
