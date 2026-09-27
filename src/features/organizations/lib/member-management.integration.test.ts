import assert from "node:assert/strict";
// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { organization } from "better-auth/plugins";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const database = new DatabaseSync(":memory:");
const options = {
  database,
  secret: "member-management-test-secret-at-least-32-characters",
  baseURL: "http://localhost:3000",
  emailAndPassword: { enabled: true },
  plugins: [organization({ membershipLimit: 100, teams: { enabled: true } })],
  logger: { level: "error" as const },
};
await (await getMigrations(options)).runMigrations();
const auth = betterAuth(options);
let actors: { id: string; headers: Headers }[];
let orgId: string;
let teamId: string;
let secondTeamId: string;

beforeAll(async () => {
  actors = [];
  for (const name of ["owner", "admin", "member", "outsider"]) {
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email: `${name}@example.com`,
        password: "test-password-123",
      },
      asResponse: true,
    });
    const body = (await response.json()) as { user: { id: string } };
    const cookie = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    actors.push({ id: body.user.id, headers: new Headers({ cookie }) });
  }
});
afterAll(() => database.close());
beforeEach(async () => {
  const owner = actors[0];
  const org = await auth.api.createOrganization({
    headers: owner.headers,
    body: {
      name: "Test organization",
      slug: crypto.randomUUID(),
      keepCurrentActiveOrganization: true,
    },
  });
  assert(org);
  orgId = org.id;
  await auth.api.addMember({
    body: { organizationId: orgId, userId: actors[1].id, role: "admin" },
  });
  await auth.api.addMember({
    body: { organizationId: orgId, userId: actors[2].id, role: "member" },
  });
  const team = await auth.api.createTeam({
    headers: owner.headers,
    body: { organizationId: orgId, name: "First team" },
  });
  const second = await auth.api.createTeam({
    headers: owner.headers,
    body: { organizationId: orgId, name: "Second team" },
  });
  teamId = team.id;
  secondTeamId = second.id;
});

describe("installed Better Auth member-management defaults", () => {
  it("rejects anonymous and foreign organization reads", async () => {
    await expect(
      auth.api.listMembers({
        headers: new Headers(),
        query: { organizationId: orgId },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.listMembers({
        headers: actors[3].headers,
        query: { organizationId: orgId },
      }),
    ).rejects.toThrow();
  });
  it("allows all organization roles to list summaries but requires team membership for every roster reader", async () => {
    for (const actor of actors.slice(0, 3)) {
      expect(
        (
          await auth.api.listOrganizationTeams({
            headers: actor.headers,
            query: { organizationId: orgId },
          })
        ).map((team) => team.id),
      ).toEqual(expect.arrayContaining([teamId, secondTeamId]));
      await expect(
        auth.api.listTeamMembers({ headers: actor.headers, query: { teamId } }),
      ).rejects.toMatchObject({
        body: { code: "USER_IS_NOT_A_MEMBER_OF_THE_TEAM" },
      });
    }
    await auth.api.addTeamMember({
      headers: actors[0].headers,
      body: { organizationId: orgId, teamId, userId: actors[2].id },
    });
    expect(
      await auth.api.listTeamMembers({
        headers: actors[2].headers,
        query: { teamId },
      }),
    ).toHaveLength(1);
  });
  it("rejects member writes and admin ownership changes", async () => {
    const { members } = await auth.api.listMembers({
      headers: actors[0].headers,
      query: { organizationId: orgId },
    });
    const ownerMembership = members.find(
      (member) => member.userId === actors[0].id,
    );
    const regularMembership = members.find(
      (member) => member.userId === actors[2].id,
    );
    assert(ownerMembership);
    assert(regularMembership);
    await expect(
      auth.api.updateMemberRole({
        headers: actors[1].headers,
        body: {
          organizationId: orgId,
          memberId: ownerMembership.id,
          role: "member",
        },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.updateMemberRole({
        headers: actors[1].headers,
        body: {
          organizationId: orgId,
          memberId: regularMembership.id,
          role: "owner",
        },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.removeMember({
        headers: actors[1].headers,
        body: { organizationId: orgId, memberIdOrEmail: ownerMembership.id },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.addTeamMember({
        headers: actors[2].headers,
        body: { organizationId: orgId, teamId, userId: actors[2].id },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.removeMember({
        headers: actors[2].headers,
        body: { organizationId: orgId, memberIdOrEmail: regularMembership.id },
      }),
    ).rejects.toThrow();
  });
  it("permits admin self-demotion and self-removal", async () => {
    const { members } = await auth.api.listMembers({
      headers: actors[1].headers,
      query: { organizationId: orgId },
    });
    const adminMembership = members.find(
      (member) => member.userId === actors[1].id,
    );
    assert(adminMembership);
    await auth.api.updateMemberRole({
      headers: actors[1].headers,
      body: {
        organizationId: orgId,
        memberId: adminMembership.id,
        role: "member",
      },
    });
    await auth.api.updateMemberRole({
      headers: actors[0].headers,
      body: {
        organizationId: orgId,
        memberId: adminMembership.id,
        role: "admin",
      },
    });
    await auth.api.removeMember({
      headers: actors[1].headers,
      body: { organizationId: orgId, memberIdOrEmail: adminMembership.id },
    });
    await expect(
      auth.api.listMembers({
        headers: actors[1].headers,
        query: { organizationId: orgId },
      }),
    ).rejects.toThrow();
  });
  it("protects the sole owner but permits owner self-actions once another owner exists", async () => {
    const { members } = await auth.api.listMembers({
      headers: actors[0].headers,
      query: { organizationId: orgId },
    });
    const owner = members.find((member) => member.userId === actors[0].id);
    assert(owner);
    const admin = members.find((member) => member.userId === actors[1].id);
    assert(admin);
    await expect(
      auth.api.updateMemberRole({
        headers: actors[0].headers,
        body: { organizationId: orgId, memberId: owner.id, role: "member" },
      }),
    ).rejects.toThrow();
    await expect(
      auth.api.removeMember({
        headers: actors[0].headers,
        body: { organizationId: orgId, memberIdOrEmail: owner.id },
      }),
    ).rejects.toThrow();
    await auth.api.updateMemberRole({
      headers: actors[0].headers,
      body: { organizationId: orgId, memberId: admin.id, role: "owner" },
    });
    await auth.api.updateMemberRole({
      headers: actors[0].headers,
      body: { organizationId: orgId, memberId: owner.id, role: "admin" },
    });
    await auth.api.updateMemberRole({
      headers: actors[1].headers,
      body: { organizationId: orgId, memberId: owner.id, role: "owner" },
    });
    await auth.api.removeMember({
      headers: actors[0].headers,
      body: { organizationId: orgId, memberIdOrEmail: owner.id },
    });
  });
  it("ensures membership idempotently and team self-removal preserves organization/other-team membership", async () => {
    const actor = actors[1];
    const body = { organizationId: orgId, teamId, userId: actor.id };
    const first = await auth.api.addTeamMember({
      headers: actor.headers,
      body,
    });
    const repeated = await auth.api.addTeamMember({
      headers: actor.headers,
      body,
    });
    expect(repeated.id).toBe(first.id);
    await auth.api.addTeamMember({
      headers: actor.headers,
      body: { ...body, teamId: secondTeamId },
    });
    await auth.api.removeTeamMember({ headers: actor.headers, body });
    expect(
      (
        await auth.api.listMembers({
          headers: actor.headers,
          query: { organizationId: orgId },
        })
      ).total,
    ).toBe(3);
    expect(
      await auth.api.listTeamMembers({
        headers: actor.headers,
        query: { teamId: secondTeamId },
      }),
    ).toHaveLength(1);
    await expect(
      auth.api.removeTeamMember({ headers: actor.headers, body }),
    ).rejects.toMatchObject({
      body: { code: "USER_IS_NOT_A_MEMBER_OF_THE_TEAM" },
    });
  });
  it("cleans all team memberships on organization removal and rejects foreign targets/scopes", async () => {
    const owner = actors[0];
    for (const team of [teamId, secondTeamId])
      await auth.api.addTeamMember({
        headers: owner.headers,
        body: { organizationId: orgId, teamId: team, userId: actors[2].id },
      });
    const { members } = await auth.api.listMembers({
      headers: owner.headers,
      query: { organizationId: orgId },
    });
    const targetMember = members.find(
      (member) => member.userId === actors[2].id,
    );
    assert(targetMember);
    await auth.api.removeMember({
      headers: owner.headers,
      body: {
        organizationId: orgId,
        memberIdOrEmail: targetMember.id,
      },
    });
    const count = database
      .prepare(
        'SELECT count(*) AS count FROM "teamMember" WHERE "userId" = ? AND "teamId" IN (?, ?)',
      )
      .get(actors[2].id, teamId, secondTeamId) as { count: number };
    expect(count.count).toBe(0);
    await expect(
      auth.api.addTeamMember({
        headers: owner.headers,
        body: { organizationId: orgId, teamId, userId: actors[3].id },
      }),
    ).rejects.toThrow();
    const foreign = await auth.api.createOrganization({
      headers: actors[3].headers,
      body: {
        name: "Foreign",
        slug: crypto.randomUUID(),
        keepCurrentActiveOrganization: true,
      },
    });
    const foreignMemberId = foreign?.members?.[0]?.id;
    assert(foreignMemberId);
    await expect(
      auth.api.updateMemberRole({
        headers: owner.headers,
        body: {
          organizationId: orgId,
          memberId: foreignMemberId,
          role: "member",
        },
      }),
    ).rejects.toThrow();
  });
  it("uses an explicitly supplied organization while another organization is active", async () => {
    const owner = actors[0];
    const different = await auth.api.createOrganization({
      headers: owner.headers,
      body: {
        name: "Different active organization",
        slug: crypto.randomUUID(),
      },
    });
    expect(
      (await auth.api.getSession({ headers: owner.headers }))?.session,
    ).toMatchObject({ activeOrganizationId: different?.id });
    await auth.api.addTeamMember({
      headers: owner.headers,
      body: { organizationId: orgId, teamId, userId: actors[1].id },
    });
    await auth.api.removeTeamMember({
      headers: owner.headers,
      body: { organizationId: orgId, teamId, userId: actors[1].id },
    });
  });
});
