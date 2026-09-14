import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats a Date with the full month by default", () => {
    expect(formatDate(new Date("2026-09-14T12:00:00Z"))).toBe(
      new Date("2026-09-14T12:00:00Z").toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  });

  it("accepts an ISO string as well as a Date", () => {
    const iso = "2026-09-14T12:00:00Z";

    expect(formatDate(iso)).toBe(formatDate(new Date(iso)));
  });

  it("abbreviates the month when asked", () => {
    const long = formatDate("2026-09-14T12:00:00Z", "long");
    const short = formatDate("2026-09-14T12:00:00Z", "short");

    expect(short.length).toBeLessThanOrEqual(long.length);
    expect(short).not.toBe(long);
  });
});
