import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import type { SessionData, User } from "#/features/auth/types";
import { generateFakeMember } from "#/features/organizations/lib/faker-member";
import { findSoleOwnedOrgs } from "#/features/organizations/lib/org";
import { db } from "#/lib/db";
import { user as userTable } from "#/lib/db/schema";

/**
 * Drives the account-deletion warning: which organizations would be left with
 * no owner — stranded and unreachable — if this account went away.
 */
export const listSoleOwnedOrgs = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) throw new Error("Unauthorized");

    const memberships = await db.query.member.findMany({
      where: (member, { eq }) => eq(member.userId, session.user.id),
      with: {
        organization: {
          with: { members: { columns: { userId: true, role: true } } },
        },
      },
    });

    return findSoleOwnedOrgs(
      memberships.map((membership) => membership.organization),
      session.user.id,
    );
  },
);

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
  .validator(getOrgSchema)
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

const createFakeMemberSchema = z.object({ organizationId: z.string() });

/**
 * Adds a generated teammate to an organization, for trying the app out.
 *
 * `auth.api.addMember` is server-only and runs no session or permission check of
 * its own — its own docs say the caller must authorize — so this does it here.
 *
 * The user row is inserted directly rather than through `auth.api.signUpEmail`,
 * which would issue a session and clobber the caller's own cookie via
 * `tanstackStartCookies`.
 */
export const createFakeMember = createServerFn({ method: "POST" })
  .validator(createFakeMemberSchema)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) throw new Error("Unauthorized");

    const callerMembership = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.organizationId, data.organizationId),
          eq(member.userId, session.user.id),
        ),
    });
    if (
      !callerMembership ||
      (callerMembership.role !== "owner" && callerMembership.role !== "admin")
    ) {
      throw new Error("Only owners and admins can add members");
    }

    const fake = generateFakeMember();
    const [inserted] = await db
      .insert(userTable)
      .values({
        id: crypto.randomUUID(),
        name: `${fake.firstName} ${fake.lastName}`,
        email: fake.email,
        emailVerified: true,
        firstName: fake.firstName,
        lastName: fake.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await auth.api.addMember({
      body: {
        organizationId: data.organizationId,
        userId: inserted.id,
        role: "member",
      },
    });

    return { name: inserted.name, email: inserted.email };
  });

const getUserTeamsSchema = z.object({ organizationId: z.string() });

export const getUserTeams = createServerFn({ method: "GET" })
  .validator(getUserTeamsSchema)
  .handler(async ({ data }) => {
    const teams = await auth.api.listUserTeams({
      headers: getRequestHeaders(),
      query: { organizationId: data.organizationId },
    });
    return teams ?? [];
  });
