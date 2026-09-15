import { describe, expect, it } from "vitest";
import {
  canManage,
  findMemberRole,
  findSoleOwnedOrgs,
  pickActiveOrganizationId,
} from "./org";

const ME = "user-me";

function org(id: string, members: { userId: string; role: string | null }[]) {
  return { id, name: `Org ${id}`, members };
}

describe("findSoleOwnedOrgs", () => {
  it("returns an org where I'm the only owner and the only member", () => {
    const orgs = [org("a", [{ userId: ME, role: "owner" }])];

    expect(findSoleOwnedOrgs(orgs, ME)).toEqual([
      { id: "a", name: "Org a", otherMemberCount: 0 },
    ]);
  });

  it("counts the people who would lose access", () => {
    const orgs = [
      org("a", [
        { userId: ME, role: "owner" },
        { userId: "u2", role: "admin" },
        { userId: "u3", role: "member" },
      ]),
    ];

    expect(findSoleOwnedOrgs(orgs, ME)).toEqual([
      { id: "a", name: "Org a", otherMemberCount: 2 },
    ]);
  });

  it("skips orgs that have another owner", () => {
    const orgs = [
      org("a", [
        { userId: ME, role: "owner" },
        { userId: "u2", role: "owner" },
      ]),
    ];

    expect(findSoleOwnedOrgs(orgs, ME)).toEqual([]);
  });

  it("skips orgs where I'm not an owner", () => {
    const orgs = [
      org("a", [
        { userId: "u2", role: "owner" },
        { userId: ME, role: "admin" },
      ]),
    ];

    expect(findSoleOwnedOrgs(orgs, ME)).toEqual([]);
  });

  it("reads comma-joined roles", () => {
    const orgs = [
      org("a", [
        { userId: ME, role: "owner,sales" },
        { userId: "u2", role: "member" },
      ]),
      org("b", [
        { userId: ME, role: "member" },
        { userId: "u2", role: "sales,owner" },
      ]),
    ];

    expect(findSoleOwnedOrgs(orgs, ME)).toEqual([
      { id: "a", name: "Org a", otherMemberCount: 1 },
    ]);
  });

  it("returns every sole-owned org at once", () => {
    const orgs = [
      org("a", [{ userId: ME, role: "owner" }]),
      org("b", [
        { userId: ME, role: "owner" },
        { userId: "u2", role: "owner" },
      ]),
      org("c", [
        { userId: ME, role: "owner" },
        { userId: "u2", role: "member" },
      ]),
    ];

    expect(findSoleOwnedOrgs(orgs, ME).map((o) => o.id)).toEqual(["a", "c"]);
  });
});

const ORGS = ["org-a", "org-b", "org-c"];

describe("pickActiveOrganizationId", () => {
  it("keeps the current organization when the user is still a member", () => {
    expect(pickActiveOrganizationId(ORGS, "org-b")).toBe("org-b");
  });

  it("falls back to the longest-standing membership when the current one is stale", () => {
    expect(pickActiveOrganizationId(ORGS, "org-gone")).toBe("org-a");
  });

  it("falls back when there is no current organization", () => {
    expect(pickActiveOrganizationId(ORGS, null)).toBe("org-a");
    expect(pickActiveOrganizationId(ORGS, undefined)).toBe("org-a");
  });

  it("treats an empty string as unset rather than matching on it", () => {
    expect(pickActiveOrganizationId(ORGS, "")).toBe("org-a");
  });

  it("returns null when the user belongs to no organization", () => {
    expect(pickActiveOrganizationId([], "org-gone")).toBeNull();
    expect(pickActiveOrganizationId([], null)).toBeNull();
  });
});

describe("findMemberRole", () => {
  const members = [
    { userId: "u1", role: "owner" },
    { userId: ME, role: "admin" },
  ];

  it("returns the role this user holds", () => {
    expect(findMemberRole(members, ME)).toBe("admin");
  });

  it("returns undefined for someone who is not a member", () => {
    expect(findMemberRole(members, "stranger")).toBeUndefined();
  });

  it("normalises a null role to undefined", () => {
    expect(findMemberRole([{ userId: ME, role: null }], ME)).toBeUndefined();
  });
});

describe("canManage", () => {
  it("lets owners and admins manage", () => {
    expect(canManage("owner")).toBe(true);
    expect(canManage("admin")).toBe(true);
  });

  it("keeps plain members out", () => {
    expect(canManage("member")).toBe(false);
  });

  it("reads comma-joined roles, not just the whole string", () => {
    expect(canManage("admin,sales")).toBe(true);
    expect(canManage("sales,owner")).toBe(true);
    expect(canManage("member,sales")).toBe(false);
  });

  it("treats a missing role as no permission", () => {
    expect(canManage(null)).toBe(false);
    expect(canManage(undefined)).toBe(false);
    expect(canManage("")).toBe(false);
  });
});
