import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { auth } from "#/features/auth/lib/auth";
import { authMiddleware } from "#/features/auth/middleware";
import {
  batchUserIdsSchema,
  memberPage,
  memberPageInputSchema,
  organizationIdSchema,
  organizationRoleSchema,
  teamIdSchema,
} from "#/features/organizations/lib/member-management";
import {
  membershipBatch,
  organizationContext,
  organizationRoster,
  resolveTeam,
  teamRoster,
} from "#/features/organizations/lib/member-management.server";
import { canManage } from "#/features/organizations/lib/org";

export const getOrganizationMemberContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(organizationIdSchema)
  .handler(({ data, context }) =>
    organizationContext(data.organizationId, context.session.user.id),
  );

export const listOrganizationMembersPage = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(organizationIdSchema.extend(memberPageInputSchema.shape))
  .handler(async ({ data }) =>
    memberPage(
      (await organizationRoster(data.organizationId)).rows,
      data.q,
      data.page,
    ),
  );

export const listAssignableTeams = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(organizationIdSchema)
  .handler(async ({ data }) => {
    const teams = await auth.api.listOrganizationTeams({
      headers: getRequestHeaders(),
      query: data,
    });
    return teams
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  });

/** One authorized roster read supplies the main page and manager-only candidates. */
export const getTeamMembersPage = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(teamIdSchema.extend(memberPageInputSchema.shape))
  .handler(async ({ data, context }) => {
    const team = await resolveTeam(data.teamId);
    const roster = await teamRoster(team.id, team.organizationId);
    const org = await organizationContext(
      team.organizationId,
      context.session.user.id,
    );
    return {
      teamId: team.id,
      name: team.name,
      slug: org.slug,
      organizationId: org.id,
      organizationName: org.name,
      userId: org.userId,
      role: org.role,
      members: memberPage(roster.rows, data.q, data.page),
      candidates: canManage(org.role) ? roster.candidates : [],
    };
  });

export const updateOrganizationMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    organizationIdSchema.extend({
      memberId: z.string().min(1),
      role: organizationRoleSchema,
    }),
  )
  .handler(async ({ data }) => {
    await auth.api.updateMemberRole({
      headers: getRequestHeaders(),
      body: data,
    });
  });

export const removeOrganizationMembers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(organizationIdSchema.extend({ userIds: batchUserIdsSchema }))
  .handler(async ({ data, context }) => {
    const { rows } = await organizationRoster(data.organizationId);
    const membershipIds = new Map(
      rows.map((row) => [row.userId, row.memberId]),
    );
    return membershipBatch(
      data.userIds,
      async (userId) => {
        const memberId = membershipIds.get(userId);
        if (!memberId) return "No longer in this organization.";
        await auth.api.removeMember({
          headers: getRequestHeaders(),
          body: {
            organizationId: data.organizationId,
            memberIdOrEmail: memberId,
          },
        });
      },
      { removedCallerId: context.session.user.id },
    );
  });

export const addTeamMembers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(teamIdSchema.extend({ userIds: batchUserIdsSchema }))
  .handler(async ({ data }) => {
    const team = await resolveTeam(data.teamId);
    return membershipBatch(data.userIds, async (userId) => {
      await auth.api.addTeamMember({
        headers: getRequestHeaders(),
        body: { teamId: team.id, organizationId: team.organizationId, userId },
      });
    });
  });

export const removeTeamMembers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(teamIdSchema.extend({ userIds: batchUserIdsSchema }))
  .handler(async ({ data }) => {
    const team = await resolveTeam(data.teamId);
    return membershipBatch(
      data.userIds,
      async (userId) => {
        await auth.api.removeTeamMember({
          headers: getRequestHeaders(),
          body: {
            teamId: team.id,
            organizationId: team.organizationId,
            userId,
          },
        });
      },
      { removingFromTeam: true },
    );
  });

export const getOrganizationOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(organizationIdSchema)
  .handler(async ({ data, context }) => {
    const org = await organizationContext(
      data.organizationId,
      context.session.user.id,
    );
    const [roster, teams] = await Promise.all([
      organizationRoster(org.id),
      auth.api.listOrganizationTeams({
        headers: getRequestHeaders(),
        query: { organizationId: org.id },
      }),
    ]);
    return {
      ...org,
      memberCount: roster.total,
      members: memberPage(roster.rows).rows.slice(0, 5),
      teams: teams.map(({ id, name }) => ({ id, name })),
    };
  });

export const getTeamOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(teamIdSchema)
  .handler(async ({ data, context }) => {
    const team = await resolveTeam(data.teamId);
    const org = await organizationContext(
      team.organizationId,
      context.session.user.id,
    );
    const ownTeams = await auth.api.listUserTeams({
      headers: getRequestHeaders(),
      query: { organizationId: org.id },
    });
    const roster = ownTeams.some((ownTeam) => ownTeam.id === team.id)
      ? await teamRoster(team.id, org.id)
      : undefined;
    return {
      ...team,
      role: org.role,
      organization: { name: org.name },
      memberCount: roster?.rows.length,
      members: roster ? memberPage(roster.rows).rows.slice(0, 5) : undefined,
    };
  });

export const getDashboardOrganization = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(organizationIdSchema)
  .handler(async ({ data, context }) => {
    const org = await organizationContext(
      data.organizationId,
      context.session.user.id,
    );
    const isManager = canManage(org.role);
    const [roster, invitations] = await Promise.all([
      organizationRoster(org.id),
      isManager
        ? auth.api.listInvitations({
            headers: getRequestHeaders(),
            query: { organizationId: org.id },
          })
        : [],
    ]);
    return {
      ...org,
      isManager,
      members: roster.rows.map((row) => ({
        id: row.memberId,
        userId: row.userId,
        role: row.role,
        user: { name: row.name, email: row.email, image: row.image },
      })),
      invitations,
    };
  });
