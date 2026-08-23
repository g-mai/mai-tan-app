import { describe, expect, it } from "vitest";
import {
  ABANDONED_AFTER_MS,
  isAbandonedRegistration,
} from "./abandoned-registration";

const now = new Date("2026-01-10T12:00:00Z");
const longAgo = new Date(now.getTime() - ABANDONED_AFTER_MS - 1000);
const justNow = new Date(now.getTime() - 60_000);

function user(
  overrides: Partial<Parameters<typeof isAbandonedRegistration>[0]> = {},
) {
  return {
    createdAt: longAgo,
    accounts: [],
    members: [],
    ...overrides,
  };
}

describe("isAbandonedRegistration", () => {
  it("is true for a passwordless, org-less user past the cutoff", () => {
    expect(isAbandonedRegistration(user(), now)).toBe(true);
  });

  it("is false once a password has been set", () => {
    expect(
      isAbandonedRegistration(
        user({ accounts: [{ providerId: "credential" }] }),
        now,
      ),
    ).toBe(false);
  });

  // The condition that keeps fake teammates and invited users alive.
  it("is false for a passwordless user who belongs to an organization", () => {
    expect(
      isAbandonedRegistration(user({ members: [{ id: "member-1" }] }), now),
    ).toBe(false);
  });

  it("is false before the cutoff, even with nothing set up", () => {
    expect(isAbandonedRegistration(user({ createdAt: justNow }), now)).toBe(
      false,
    );
  });

  it("is false exactly one millisecond before the cutoff", () => {
    const createdAt = new Date(now.getTime() - ABANDONED_AFTER_MS + 1);

    expect(isAbandonedRegistration(user({ createdAt }), now)).toBe(false);
  });

  it("ignores non-credential accounts", () => {
    expect(
      isAbandonedRegistration(
        user({ accounts: [{ providerId: "github" }] }),
        now,
      ),
    ).toBe(true);
  });
});
