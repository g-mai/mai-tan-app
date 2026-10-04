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
  plugins: [
    organization({
      membershipLimit: 100,
      teams: { enabled: true, allowRemovingAllTeams: false },
    }),
  ],
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

describe("installed Better Auth team deletion behavior", () => {
  it.each([
    { role: "owner", actorIndex: 0 },
    { role: "admin", actorIndex: 1 },
  ])(
    "allows an organization $role to delete a team",
    async ({ actorIndex }) => {
      const owner = actors[0];
      const actor = actors[actorIndex];
      await auth.api.addTeamMember({
        headers: owner.headers,
        body: {
          organizationId: orgId,
          teamId: secondTeamId,
          userId: actors[2].id,
        },
      });

      await expect(
        auth.api.removeTeam({
          headers: actor.headers,
          body: { teamId: secondTeamId, organizationId: orgId },
        }),
      ).resolves.toMatchObject({ message: "Team removed successfully." });

      const remainingTeams = await auth.api.listOrganizationTeams({
        headers: owner.headers,
        query: { organizationId: orgId },
      });
      expect(remainingTeams).toHaveLength(2);
      expect(remainingTeams.map((team) => team.id)).toContain(teamId);
      expect(remainingTeams.map((team) => team.id)).not.toContain(secondTeamId);
      const teamMemberships = database
        .prepare(
          'SELECT count(*) AS count FROM "teamMember" WHERE "teamId" = ?',
        )
        .get(secondTeamId) as { count: number };
      expect(teamMemberships.count).toBe(0);
      expect(
        (
          await auth.api.listMembers({
            headers: actors[2].headers,
            query: { organizationId: orgId },
          })
        ).total,
      ).toBe(3);
    },
  );

  it("rejects members and non-members from deleting teams", async () => {
    await expect(
      auth.api.removeTeam({
        headers: actors[2].headers,
        body: { teamId: secondTeamId, organizationId: orgId },
      }),
    ).rejects.toMatchObject({
      body: {
        code: "YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION",
      },
    });
    await expect(
      auth.api.removeTeam({
        headers: actors[3].headers,
        body: { teamId: secondTeamId, organizationId: orgId },
      }),
    ).rejects.toMatchObject({
      body: { code: "YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM" },
    });
    expect(
      (
        await auth.api.listOrganizationTeams({
          headers: actors[0].headers,
          query: { organizationId: orgId },
        })
      ).map((team) => team.id),
    ).toEqual(expect.arrayContaining([teamId, secondTeamId]));
  });

  it("blocks deleting the last team and preserves it", async () => {
    const owner = actors[0];
    await auth.api.setActiveTeam({
      headers: owner.headers,
      body: { teamId: null },
    });
    await auth.api.removeTeam({
      headers: owner.headers,
      body: { teamId: secondTeamId, organizationId: orgId },
    });
    await auth.api.removeTeam({
      headers: owner.headers,
      body: { teamId, organizationId: orgId },
    });
    const [lastTeam] = await auth.api.listOrganizationTeams({
      headers: owner.headers,
      query: { organizationId: orgId },
    });
    assert(lastTeam);

    await expect(
      auth.api.removeTeam({
        headers: owner.headers,
        body: { teamId: lastTeam.id, organizationId: orgId },
      }),
    ).rejects.toMatchObject({ body: { code: "UNABLE_TO_REMOVE_LAST_TEAM" } });
    expect(
      (
        await auth.api.listOrganizationTeams({
          headers: owner.headers,
          query: { organizationId: orgId },
        })
      ).map((team) => team.id),
    ).toEqual([lastTeam.id]);
  });

  it("does not remove a team when the supplied organization is not its owner", async () => {
    const foreignOrg = await auth.api.createOrganization({
      headers: actors[3].headers,
      body: { name: "Foreign", slug: crypto.randomUUID() },
    });
    assert(foreignOrg);
    const [foreignTeam] = await auth.api.listOrganizationTeams({
      headers: actors[3].headers,
      query: { organizationId: foreignOrg.id },
    });
    assert(foreignTeam);

    await expect(
      auth.api.removeTeam({
        headers: actors[0].headers,
        body: { teamId: foreignTeam.id, organizationId: orgId },
      }),
    ).rejects.toMatchObject({ body: { code: "TEAM_NOT_FOUND" } });
    expect(
      (
        await auth.api.listOrganizationTeams({
          headers: actors[3].headers,
          query: { organizationId: foreignOrg.id },
        })
      ).map((team) => team.id),
    ).toContain(foreignTeam.id);
  });
});

describe("installed Better Auth organization deletion behavior", () => {
  it("allows the owner to delete an organization and cascades its data", async () => {
    const owner = actors[0];
    const anotherOrg = await auth.api.createOrganization({
      headers: owner.headers,
      body: {
        name: "Another organization",
        slug: crypto.randomUUID(),
      },
    });
    assert(anotherOrg);
    await auth.api.setActiveOrganization({
      headers: owner.headers,
      body: { organizationId: orgId },
    });
    await auth.api.addTeamMember({
      headers: owner.headers,
      body: { organizationId: orgId, teamId, userId: actors[2].id },
    });
    await auth.api.createInvitation({
      headers: owner.headers,
      body: {
        email: "pending@example.com",
        role: "member",
        organizationId: orgId,
      },
    });

    await expect(
      auth.api.deleteOrganization({
        headers: owner.headers,
        body: { organizationId: orgId },
      }),
    ).resolves.toMatchObject({ id: orgId });

    const deletedOrg = database
      .prepare('SELECT count(*) AS count FROM "organization" WHERE "id" = ?')
      .get(orgId) as { count: number };
    expect(deletedOrg.count).toBe(0);
    for (const table of ["member", "invitation", "team"]) {
      const row = database
        .prepare(
          `SELECT count(*) AS count FROM "${table}" WHERE "organizationId" = ?`,
        )
        .get(orgId) as { count: number };
      expect(row.count, `${table} rows for deleted organization`).toBe(0);
    }
    const teamMembers = database
      .prepare(
        'SELECT count(*) AS count FROM "teamMember" WHERE "teamId" IN (?, ?)',
      )
      .get(teamId, secondTeamId) as { count: number };
    expect(teamMembers.count).toBe(0);
    expect(
      (await auth.api.listOrganizations({ headers: owner.headers })).map(
        (organization) => organization.id,
      ),
    ).toContain(anotherOrg.id);
    const session = database
      .prepare(
        'SELECT "activeOrganizationId" FROM "session" WHERE "userId" = ?',
      )
      .get(owner.id) as { activeOrganizationId: string | null };
    expect(session.activeOrganizationId).toBeNull();
  });

  it.each([
    { role: "admin", actorIndex: 1 },
    { role: "member", actorIndex: 2 },
  ])(
    "does not allow an organization $role to delete it",
    async ({ actorIndex }) => {
      await expect(
        auth.api.deleteOrganization({
          headers: actors[actorIndex].headers,
          body: { organizationId: orgId },
        }),
      ).rejects.toMatchObject({
        body: { code: "YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION" },
      });
      expect(
        database
          .prepare('SELECT "id" FROM "organization" WHERE "id" = ?')
          .get(orgId),
      ).toBeTruthy();
    },
  );

  it("does not allow an outsider to delete an organization", async () => {
    await expect(
      auth.api.deleteOrganization({
        headers: actors[3].headers,
        body: { organizationId: orgId },
      }),
    ).rejects.toMatchObject({
      body: { code: "USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION" },
    });
    expect(
      database
        .prepare('SELECT "id" FROM "organization" WHERE "id" = ?')
        .get(orgId),
    ).toBeTruthy();
  });
});
