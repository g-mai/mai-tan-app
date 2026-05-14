import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/lib/better-auth/auth";
import type { SessionData, User } from "#/types/auth-types";

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
    console.log("TEAMS FOUND!", teams);
    console.log("data", data);
    const team = teams.find((t) => t.id === data.id);
    if (!team) throw new Error("Team not found");
    return team;
  });
