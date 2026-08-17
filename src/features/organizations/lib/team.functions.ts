import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import { authMiddleware } from "#/features/auth/middleware";
import type { SessionData, User } from "#/features/auth/types";
import { db } from "#/lib/db";

export const listTeams = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const memberships = await db.query.member.findMany({
      where: (member, { eq }) => eq(member.userId, context.session.user.id),
      columns: { organizationId: true },
    });
    if (memberships.length === 0) return [];

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

const getTeamSchema = z.object({
  id: z.string(),
  session: z.custom<SessionData>().optional(),
  user: z.custom<User>().optional(),
});

export const getTeam = createServerFn({ method: "GET" })
  .validator(getTeamSchema)
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
  .validator(getFullTeamSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
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
          eq(member.userId, context.session.user.id),
        ),
    });
    if (!orgMember)
      throw new Error("User is not a member of this organization");

    return {
      ...teamData,
      role: orgMember.role,
    };
  });
