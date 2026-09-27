import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { api, teamRead, orgRead, requestHeaders } = vi.hoisted(() => ({
  api: {
    listMembers: vi.fn(),
    listTeamMembers: vi.fn(),
    getActiveMemberRole: vi.fn(),
    listOrganizationTeams: vi.fn(),
    listUserTeams: vi.fn(),
    listInvitations: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    addTeamMember: vi.fn(),
    removeTeamMember: vi.fn(),
  },
  teamRead: vi.fn(),
  orgRead: vi.fn(),
  requestHeaders: new Headers({ cookie: "session" }),
}));
vi.mock("#/features/auth/lib/auth", () => ({ auth: { api } }));
vi.mock("#/features/auth/middleware", () => ({
  authMiddleware: "authenticated",
}));
vi.mock("#/lib/db", () => ({
  db: {
    query: {
      team: { findFirst: teamRead },
      organization: { findFirst: orgRead },
    },
  },
}));
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => requestHeaders,
}));
// Run each function's own validator and handler without a Worker transport.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let schema: { parse: (data: unknown) => unknown };
    const builder = {
      middleware: () => builder,
      validator: (value: typeof schema) => {
        schema = value;
        return builder;
      },
      handler:
        (fn: (args: unknown) => unknown) =>
        ({ data }: { data: unknown }) =>
          fn({
            data: schema.parse(data),
            context: { session: { user: { id: "caller" } } },
          }),
    };
    return builder;
  },
}));

import {
  addTeamMembers,
  getDashboardOrganization,
  getOrganizationOverview,
  getTeamOverview,
  listAssignableTeams,
  listOrganizationMembersPage,
  removeOrganizationMembers,
  removeTeamMembers,
  updateOrganizationMemberRole,
} from "./member-management.functions";
import { membershipBatch } from "./member-management.server";
import { getTeamMetadata } from "./team.functions";

const roster = ["caller", "other", "owner"].map((userId) => ({
  id: `m-${userId}`,
  userId,
  role: userId === "owner" ? "owner" : "admin",
  user: {
    id: userId,
    name: userId,
    email: `${userId}@test.com`,
    image: null,
    password: "never-return",
    emailVerified: true,
  },
}));
const denied = (
  code: string,
  status: "FORBIDDEN" | "BAD_REQUEST" = "FORBIDDEN",
) => new APIError(status, { code, message: code });

beforeEach(() => {
  vi.resetAllMocks();
  teamRead.mockResolvedValue({
    id: "team",
    organizationId: "scoped-org",
    name: "Team",
    memberCount: 7,
  });
  orgRead.mockResolvedValue({ id: "scoped-org", name: "Org", slug: "org" });
  api.listMembers.mockResolvedValue({ members: roster, total: 3 });
  api.getActiveMemberRole.mockResolvedValue({ role: "admin" });
  api.listTeamMembers.mockResolvedValue([{ userId: "caller" }]);
  api.listUserTeams.mockResolvedValue([]);
  api.listOrganizationTeams.mockResolvedValue([
    { id: "z", name: "Zulu" },
    { id: "a", name: "Alpha" },
  ]);
  api.listInvitations.mockResolvedValue([]);
});

describe("scoped reads", () => {
  it("bounds and projects roster fields before paging", async () => {
    const result = await listOrganizationMembersPage({
      data: { organizationId: "scoped-org", q: "other", page: 1 },
    });
    expect(api.listMembers).toHaveBeenCalledWith({
      headers: requestHeaders,
      query: { organizationId: "scoped-org", limit: 100, offset: 0 },
    });
    expect(result.rows[0]).toEqual({
      memberId: "m-other",
      userId: "other",
      name: "other",
      email: "other@test.com",
      image: null,
      role: "admin",
    });
  });
  it("combines team IDs with organization roles and excludes existing members from candidates", async () => {
    api.listUserTeams.mockResolvedValue([{ id: "team" }]);
    const result = await getTeamOverview({
      data: { teamId: "team", q: "", page: 1 },
    });
    expect(result.members?.rows.map((row) => row.userId)).toEqual(["caller"]);
    expect(result.candidates.map((row) => row.userId)).toEqual([
      "other",
      "owner",
    ]);
    expect(result.members?.rows[0].role).toBe("admin");
    expect(api.listMembers.mock.calls[0][0].query.organizationId).toBe(
      "scoped-org",
    );
  });
  it("preserves roster denial even for an administrator", async () => {
    api.listUserTeams.mockResolvedValue([{ id: "team" }]);
    api.listTeamMembers.mockRejectedValue(
      denied("USER_IS_NOT_A_MEMBER_OF_THE_TEAM", "BAD_REQUEST"),
    );
    await expect(
      getTeamOverview({ data: { teamId: "team", q: "", page: 1 } }),
    ).rejects.toMatchObject({
      body: { code: "USER_IS_NOT_A_MEMBER_OF_THE_TEAM" },
    });
    expect(api.listMembers).not.toHaveBeenCalled();
  });
  it("omits manager-only workflow data and preserves all-team summaries for ordinary members", async () => {
    api.listUserTeams.mockResolvedValue([{ id: "team" }]);
    api.getActiveMemberRole.mockResolvedValue({ role: "member" });
    expect(
      (await getTeamOverview({ data: { teamId: "team", q: "", page: 1 } }))
        .candidates,
    ).toEqual([]);
    expect(
      (
        await getDashboardOrganization({
          data: { organizationId: "scoped-org" },
        })
      ).invitations,
    ).toEqual([]);
    expect(api.listInvitations).not.toHaveBeenCalled();
    expect(
      (
        await listAssignableTeams({ data: { organizationId: "scoped-org" } })
      ).map((team) => team.id),
    ).toEqual(["a", "z"]);
  });
  it("does not include roster counts in the metadata-only edit read", async () => {
    const result = await getTeamMetadata({ data: { id: "team" } });
    expect(result).not.toHaveProperty("memberCount");
    expect(api.listTeamMembers).not.toHaveBeenCalled();
  });
  it("returns team overview metadata without roster/count for callers outside the team", async () => {
    const result = await getTeamOverview({ data: { teamId: "team" } });
    expect(result.members).toBeUndefined();
    expect(result.memberCount).toBeUndefined();
    expect(result.candidates).toEqual([]);
    expect(api.listTeamMembers).not.toHaveBeenCalled();
    expect(api.listMembers).not.toHaveBeenCalled();
  });
  it("returns team logos and colors in organization summaries", async () => {
    api.listOrganizationTeams.mockResolvedValue([
      { id: "team", name: "Design", logo: "/team-logo.svg", color: "#123456" },
    ]);
    const result = await getOrganizationOverview({
      data: { organizationId: "scoped-org" },
    });
    expect(result.teams).toEqual([
      { id: "team", name: "Design", logo: "/team-logo.svg", color: "#123456" },
    ]);
  });
  it("paginates and filters the overview roster without changing its total team count", async () => {
    const members = Array.from({ length: 30 }, (_, index) => ({
      id: `m-${index}`,
      userId: `user-${index}`,
      role: "member",
      user: {
        name: `Person ${String(index).padStart(2, "0")}`,
        email: `${index}@test.com`,
      },
    }));
    api.listUserTeams.mockResolvedValue([{ id: "team" }]);
    api.listTeamMembers.mockResolvedValue(
      members.map(({ userId }) => ({ userId })),
    );
    api.listMembers.mockResolvedValue({ members, total: members.length });

    const page = await getTeamOverview({
      data: { teamId: "team", q: "", page: 2 },
    });
    expect(page.memberCount).toBe(30);
    expect(page.members).toMatchObject({ total: 30, page: 2 });
    expect(page.members?.rows).toHaveLength(5);
    expect(page.members?.rows[0].name).toBe("Person 25");

    const filtered = await getTeamOverview({
      data: { teamId: "team", q: "person 29", page: 2 },
    });
    expect(filtered.memberCount).toBe(30);
    expect(filtered.members).toMatchObject({ total: 1, page: 1 });
    expect(filtered.members?.rows[0].userId).toBe("user-29");
  });
});

describe("Better Auth write delegation", () => {
  it("forwards self-role changes directly with explicit scope and no membership pre-check", async () => {
    await updateOrganizationMemberRole({
      data: {
        organizationId: "scoped-org",
        memberId: "m-caller",
        role: "member",
      },
    });
    expect(api.updateMemberRole).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: {
        organizationId: "scoped-org",
        memberId: "m-caller",
        role: "member",
      },
    });
    expect(api.listMembers).not.toHaveBeenCalled();
    expect(api.getActiveMemberRole).not.toHaveBeenCalled();
    api.updateMemberRole.mockRejectedValue(
      denied(
        "YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER",
        "BAD_REQUEST",
      ),
    );
    await expect(
      updateOrganizationMemberRole({
        data: {
          organizationId: "scoped-org",
          memberId: "foreign-id",
          role: "member",
        },
      }),
    ).rejects.toBeInstanceOf(APIError);
  });
  it("ensures team membership without pre-checking, deduplicating IDs", async () => {
    const result = await addTeamMembers({
      data: { teamId: "team", userIds: ["caller", "caller", "other"] },
    });
    expect(result.succeeded).toEqual(["caller", "other"]);
    expect(api.addTeamMember).toHaveBeenCalledTimes(2);
    expect(api.addTeamMember).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: { teamId: "team", organizationId: "scoped-org", userId: "caller" },
    });
    expect(api.listTeamMembers).not.toHaveBeenCalled();
    expect(api.listMembers).not.toHaveBeenCalled();
  });
  it("skips absent scoped organization targets without searching elsewhere", async () => {
    const result = await removeOrganizationMembers({
      data: { organizationId: "scoped-org", userIds: ["foreign", "other"] },
    });
    expect(result.skipped.map((row) => row.userId)).toEqual(["foreign"]);
    expect(api.removeMember).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: { organizationId: "scoped-org", memberIdOrEmail: "m-other" },
    });
  });
  it("stops organization writes after successful caller removal", async () => {
    const result = await removeOrganizationMembers({
      data: {
        organizationId: "scoped-org",
        userIds: ["other", "caller", "owner"],
      },
    });
    expect(result.succeeded).toEqual(["other", "caller"]);
    expect(result.failed[0].code).toBe("CALLER_REMOVED");
    expect(api.removeMember).toHaveBeenCalledTimes(2);
  });
  it("maps only the specific absent-team outcome to skipped", async () => {
    api.removeTeamMember
      .mockRejectedValueOnce(
        denied("USER_IS_NOT_A_MEMBER_OF_THE_TEAM", "BAD_REQUEST"),
      )
      .mockRejectedValueOnce(
        denied("USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION", "BAD_REQUEST"),
      );
    const result = await removeTeamMembers({
      data: { teamId: "team", userIds: ["other", "foreign"] },
    });
    expect(result.skipped.map((row) => row.userId)).toEqual(["other"]);
    expect(result.failed.map((row) => row.userId)).toEqual(["foreign"]);
  });
  it("preserves successes and ambiguous failures while stopping identifiable permission loss", async () => {
    api.addTeamMember
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(denied("MEMBER_NOT_FOUND", "BAD_REQUEST"))
      .mockRejectedValueOnce(
        denied("YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER"),
      );
    const result = await addTeamMembers({
      data: { teamId: "team", userIds: ["one", "two", "three", "four"] },
    });
    expect(result.succeeded).toEqual(["one"]);
    expect(result.failed.map((row) => row.userId)).toEqual([
      "two",
      "three",
      "four",
    ]);
    expect(api.addTeamMember).toHaveBeenCalledTimes(3);
  });
  it("does not treat a capacity 403 as permission loss", async () => {
    api.addTeamMember
      .mockRejectedValueOnce(denied("TEAM_MEMBER_LIMIT_REACHED"))
      .mockResolvedValueOnce({});
    expect(
      (
        await addTeamMembers({
          data: { teamId: "team", userIds: ["full", "already-assigned"] },
        })
      ).succeeded,
    ).toEqual(["already-assigned"]);
  });
  it("performs writes sequentially and hides infrastructure details", async () => {
    let active = 0;
    const write = vi.fn(async (id: string) => {
      expect(active).toBe(0);
      active++;
      await Promise.resolve();
      active--;
      if (id === "two") throw new Error("SQL credentials/internal details");
      return undefined;
    });
    const result = await membershipBatch(["one", "two", "three"], write);
    expect(result.succeeded).toEqual(["one", "three"]);
    expect(result.failed[0].message).not.toContain("SQL");
  });
  it("rejects invalid mutation contracts before any endpoint calls", async () => {
    await expect(async () =>
      addTeamMembers({ data: { teamId: "team", userIds: [] } }),
    ).rejects.toThrow();
    await expect(async () =>
      removeTeamMembers({
        data: { teamId: "team", userIds: Array(26).fill("a") },
      }),
    ).rejects.toThrow();
    expect(api.addTeamMember).not.toHaveBeenCalled();
    expect(api.removeTeamMember).not.toHaveBeenCalled();
  });
});
