import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import { authMiddleware } from "#/features/auth/middleware";
import type { SessionData, User } from "#/features/auth/types";
import {
  organizationContext,
  resolveTeam,
} from "#/features/organizations/lib/member-management.server";

export const listTeams = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const organizations = await auth.api.listOrganizations({
      headers: getRequestHeaders(),
    });
    const teams = await Promise.all(
      organizations.map(async (org) => {
        const rows = await auth.api.listOrganizationTeams({
          headers: getRequestHeaders(),
          query: { organizationId: org.id },
        });
        return rows.map((team) => ({
          id: team.id,
          name: team.name,
          organizationId: team.organizationId,
          description: team.description,
          logo: team.logo,
          color: team.color ?? null,
          organization: { name: org.name },
        }));
      }),
    );
    return teams.flat().sort((a, b) => a.name.localeCompare(b.name));
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

const getTeamMetadataSchema = z.object({
  id: z.string(),
});

export const getTeamMetadata = createServerFn({ method: "GET" })
  .validator(getTeamMetadataSchema)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const { memberCount: _, ...teamData } = await resolveTeam(data.id);
    const org = await organizationContext(
      teamData.organizationId,
      context.session.user.id,
    );
    return { ...teamData, organization: { name: org.name }, role: org.role };
  });

const listOrgTeamsSchema = z.object({ organizationId: z.string() });

/**
 * Organization team summaries; counts are included only for the caller's teams.
 */
export const listOrgTeamsWithCounts = createServerFn({ method: "GET" })
  .validator(listOrgTeamsSchema)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const teams = await auth.api.listOrganizationTeams({
      headers: getRequestHeaders(),
      query: data,
    });
    const ownTeams = await auth.api.listUserTeams({
      headers: getRequestHeaders(),
      query: data,
    });
    const ownIds = new Set(ownTeams.map((team) => team.id));
    return Promise.all(
      teams
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(async (team) => ({
          ...team,
          memberCount: ownIds.has(team.id)
            ? (
                await auth.api.listTeamMembers({
                  headers: getRequestHeaders(),
                  query: { teamId: team.id },
                })
              ).length
            : undefined,
        })),
    );
  });
