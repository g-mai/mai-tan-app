import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import { authMiddleware } from "#/features/auth/middleware";
import { generateFakeMember } from "#/features/organizations/lib/faker-member";
import { findSoleOwnedOrgs } from "#/features/organizations/lib/org";
import { db } from "#/lib/db";
import { user as userTable } from "#/lib/db/schema";
import { getR2 } from "#/lib/storage/r2.server";

async function deleteR2Prefix(
  bucket: ReturnType<typeof getR2>["bucket"],
  prefix: string,
) {
  let cursor: string | undefined;

  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 });
    const keys = page.objects.map((object) => object.key);
    if (keys.length > 0) await bucket.delete(keys);

    if (page.truncated && !page.cursor) {
      throw new Error("R2 returned a truncated page without a cursor");
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

async function deleteOrganizationImages(
  organizationId: string,
  teamIds: string[],
) {
  let bucket: ReturnType<typeof getR2>["bucket"];
  try {
    ({ bucket } = getR2());
  } catch (error) {
    console.error("Could not access R2 while deleting organization images", {
      organizationId,
      error,
    });
    return;
  }

  for (const prefix of [
    `orgs/${organizationId}/`,
    ...teamIds.map((teamId) => `teams/${teamId}/`),
  ]) {
    try {
      await deleteR2Prefix(bucket, prefix);
    } catch (error) {
      console.error("Could not delete organization images from R2", {
        organizationId,
        prefix,
        error,
      });
    }
  }
}

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

export const deleteOrganization = createServerFn({ method: "POST" })
  .validator(z.object({ organizationId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const teams = await auth.api.listOrganizationTeams({
      headers,
      query: { organizationId: data.organizationId },
    });

    await auth.api.deleteOrganization({
      headers,
      body: { organizationId: data.organizationId },
    });

    await deleteOrganizationImages(
      data.organizationId,
      teams.map((team) => team.id),
    );

    return { organizationId: data.organizationId };
  });

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

const listOrgMembersSchema = z.object({
  organizationId: z.string().optional(),
});

/** Current members of an organization — the caller must be a member. */
export const listOrgMembers = createServerFn({ method: "GET" })
  .validator(listOrgMembersSchema)
  .handler(async ({ data }) => {
    const { members } = await auth.api.listMembers({
      headers: getRequestHeaders(),
      query: { organizationId: data.organizationId },
    });
    return members;
  });
