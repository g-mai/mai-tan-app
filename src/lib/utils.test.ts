import { describe, expect, it } from "vitest";
import { cn, slugify } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts, last one wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, undefined, null, "py-1")).toBe("px-2 py-1");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips accents", () => {
    expect(slugify("Açme Café")).toBe("acme-cafe");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("foo!!  bar__baz")).toBe("foo-bar-baz");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Foo Bar--  ")).toBe("foo-bar");
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});
