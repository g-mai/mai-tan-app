import { describe, expect, it } from "vitest";
import { filterPending, toInvitationPreview } from "./invitation";

const now = new Date("2026-01-10T12:00:00Z");

function row(
  overrides: Partial<Parameters<typeof toInvitationPreview>[0]> = {},
) {
  return {
    email: "ada@example.com",
    status: "pending",
    expiresAt: new Date("2026-01-12T12:00:00Z"),
    organization: { name: "Analytical Engines" },
    user: { name: "Charles Babbage", email: "charles@example.com" },
    ...overrides,
  };
}

describe("toInvitationPreview", () => {
  it("exposes org, inviter and invited email for a live invitation", () => {
    expect(toInvitationPreview(row(), now)).toEqual({
      status: "pending",
      organizationName: "Analytical Engines",
      inviterName: "Charles Babbage",
      email: "ada@example.com",
    });
  });

  it("falls back to the inviter's email when they have no name", () => {
    const preview = toInvitationPreview(
      row({ user: { name: null, email: "charles@example.com" } }),
      now,
    );

    expect(preview).toMatchObject({ inviterName: "charles@example.com" });
  });

  // The whole point: none of these may leak which id exists, nor the org name.
  it.each([
    ["missing", null],
    ["expired", row({ expiresAt: new Date("2026-01-09T12:00:00Z") })],
    ["already accepted", row({ status: "accepted" })],
    ["cancelled", row({ status: "canceled" })],
    ["rejected", row({ status: "rejected" })],
  ])("collapses %s into a detail-free invalid", (_label, invitation) => {
    expect(toInvitationPreview(invitation, now)).toEqual({ status: "invalid" });
  });
});

describe("filterPending", () => {
  const live = {
    id: "live",
    status: "pending",
    expiresAt: "2026-01-12T12:00:00Z",
  };
  const expired = {
    id: "expired",
    status: "pending",
    expiresAt: "2026-01-01T12:00:00Z",
  };
  const accepted = {
    id: "accepted",
    status: "accepted",
    expiresAt: "2026-01-12T12:00:00Z",
  };
  const cancelled = {
    id: "cancelled",
    status: "canceled",
    expiresAt: "2026-01-12T12:00:00Z",
  };

  it("keeps only invitations that are pending and unexpired", () => {
    const rows = [live, expired, accepted, cancelled];

    expect(filterPending(rows, now).map((r) => r.id)).toEqual(["live"]);
  });

  it("drops a pending invitation that has run out", () => {
    expect(filterPending([expired], now)).toEqual([]);
  });

  it("accepts Date expiries as well as strings", () => {
    const rows = [
      { status: "pending", expiresAt: new Date("2026-01-12T12:00:00Z") },
    ];

    expect(filterPending(rows, now)).toHaveLength(1);
  });

  it("returns an empty list unchanged", () => {
    expect(filterPending([], now)).toEqual([]);
  });
});
