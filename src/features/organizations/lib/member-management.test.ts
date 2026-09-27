import { describe, expect, it } from "vitest";
import {
  batchUserIdsSchema,
  canManageMember,
  type MemberRow,
  memberPage,
  memberSearchSchema,
  organizationMemberSearchSchema,
  retainFailedSelection,
} from "./member-management";

const rows: MemberRow[] = Array.from({ length: 26 }, (_, i) => ({
  memberId: `m${i}`,
  userId: `u${String(i).padStart(2, "0")}`,
  name: `Person ${String(i).padStart(2, "0")}`,
  email: `person${i}@example.com`,
  image: null,
  role: "member",
}));

describe("member lists", () => {
  it("searches name OR email, ignoring case and surrounding whitespace", () => {
    expect(
      memberPage(rows, "  PERSON 01 ").rows.map((row) => row.userId),
    ).toEqual(["u01"]);
    expect(memberPage(rows, "PERSON25@").rows.map((row) => row.userId)).toEqual(
      ["u25"],
    );
  });
  it.each(["%", "_", "'", "\\"])("treats %s literally", (literal) => {
    const special = { ...rows[0], name: `A${literal}B` };
    expect(memberPage([...rows, special], literal).total).toBe(1);
  });
  it("paginates 26 members and counts only matches", () => {
    expect(memberPage(rows).rows).toHaveLength(25);
    expect(memberPage(rows, "", 2)).toMatchObject({
      page: 2,
      total: 26,
      rows: [rows[25]],
    });
    expect(memberPage(rows, "Person 2").total).toBe(6);
    expect(memberPage(rows, "", 999).page).toBe(2);
    expect(memberPage(rows, "missing", 999)).toEqual({
      rows: [],
      total: 0,
      page: 1,
    });
  });
  it("sorts names case-insensitively with a stable user ID tie-breaker and email fallback", () => {
    const matching = [
      { ...rows[2], name: "alex" },
      { ...rows[1], name: "Alex" },
      { ...rows[0], name: "", email: "aaron@example.com" },
    ];
    expect(memberPage(matching).rows.map((row) => row.userId)).toEqual([
      "u00",
      "u01",
      "u02",
    ]);
  });
  it.each([undefined, "invalid", 0, -1, 1.5])(
    "defaults invalid URL page %s to one",
    (page) => {
      expect(memberSearchSchema.parse({ page }).page).toBe(1);
    },
  );
  it("validates tabs and search length independently of server inputs", () => {
    expect(organizationMemberSearchSchema.parse({ tab: "anything" })).toEqual({
      q: "",
      page: 1,
      tab: "members",
    });
    expect(memberSearchSchema.parse({ q: "x".repeat(201), page: "2" })).toEqual(
      { q: "", page: 2 },
    );
  });
});

describe("selection affordances", () => {
  it("allows self-actions and parses multiple roles without predicting last-owner safety", () => {
    expect(canManageMember("owner", "owner")).toBe(true);
    expect(canManageMember("admin", "admin")).toBe(true);
    expect(canManageMember("admin,sales", "member")).toBe(true);
    expect(canManageMember("admin", "sales,owner")).toBe(false);
    expect(canManageMember("member", "member")).toBe(false);
  });
  it("retains only failed targets on the current page", () => {
    expect(
      retainFailedSelection(
        {
          succeeded: ["u00"],
          skipped: [{ userId: "u01", reason: "absent" }],
          failed: [
            { userId: "u02", code: "DENIED", message: "Denied" },
            { userId: "gone", code: "DENIED", message: "Denied" },
          ],
        },
        rows,
      ),
    ).toEqual(["u02"]);
  });
  it("deduplicates in order and rejects empty or oversized batches", () => {
    expect(batchUserIdsSchema.parse(["a", "b", "a"])).toEqual(["a", "b"]);
    expect(batchUserIdsSchema.safeParse([]).success).toBe(false);
    expect(batchUserIdsSchema.safeParse([""]).success).toBe(false);
    expect(batchUserIdsSchema.safeParse(Array(26).fill("a")).success).toBe(
      false,
    );
  });
});
