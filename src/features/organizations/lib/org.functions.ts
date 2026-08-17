import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import { authMiddleware } from "#/features/auth/middleware";
import { generateFakeMember } from "#/features/organizations/lib/faker-member";
import { findSoleOwnedOrgs } from "#/features/organizations/lib/org";
import { db } from "#/lib/db";
import { user as userTable } from "#/lib/db/schema";

/**
 * Drives the account-deletion warning: which organizations would be left with
 * no owner — stranded and unreachable — if this account went away.
 */
export const listSoleOwnedOrgs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const memberships = await db.query.member.findMany({
      where: (member, { eq }) => eq(member.userId, context.session.user.id),
      with: {
        organization: {
          with: { members: { columns: { userId: true, role: true } } },
        },
      },
    });

    return findSoleOwnedOrgs(
      memberships.map((membership) => membership.organization),
      context.session.user.id,
    );
  });

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

const createFakeMemberSchema = z.object({ organizationId: z.string() });

/**
 * Adds a generated teammate to an organization, for trying the app out.
 */
export const createFakeMember = createServerFn({ method: "POST" })
  .validator(createFakeMemberSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const callerMembership = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.organizationId, data.organizationId),
          eq(member.userId, context.session.user.id),
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
