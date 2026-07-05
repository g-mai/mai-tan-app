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
  user: z.custom<User>(),
  session: z.custom<SessionData>(),
});

export const getFullTeam = createServerFn({ method: "GET" })
  .inputValidator(getFullTeamSchema)
  .handler(async ({ data }) => {
    const teamData = await db.query.team.findFirst({
      where: (team, { eq }) => eq(team.id, data.id),
      with: {
        teamMembers: true,
      },
    });
    if (!teamData) throw new Error("Team not found");
    const orgMember = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.organizationId, teamData.organizationId),
          eq(member.userId, data.user.id),
        ),
    });
    if (!orgMember)
      throw new Error("User is not a member of this organization");

    return {
      ...teamData,
      role: orgMember.role,
    };
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
