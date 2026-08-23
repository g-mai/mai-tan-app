import { describe, expect, it } from "vitest";
import { findSoleOwnedOrgs } from "./org";

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
