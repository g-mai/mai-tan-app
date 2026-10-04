import { beforeEach, describe, expect, it, vi } from "vitest";

const { api, bucket, requestHeaders, getR2 } = vi.hoisted(() => ({
  api: {
    listOrganizationTeams: vi.fn(),
    deleteOrganization: vi.fn(),
  },
  bucket: {
    list: vi.fn(),
    delete: vi.fn(),
  },
  requestHeaders: new Headers({ cookie: "session" }),
  getR2: vi.fn(),
}));

vi.mock("#/features/auth/lib/auth", () => ({ auth: { api } }));
vi.mock("#/features/auth/middleware", () => ({
  authMiddleware: "authenticated",
}));
vi.mock("#/lib/db", () => ({ db: {} }));
vi.mock("#/lib/db/schema", () => ({ user: {} }));
vi.mock("#/lib/storage/r2.server", () => ({ getR2 }));
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => requestHeaders,
}));
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

import { deleteOrganization } from "./org.functions";

beforeEach(() => {
  vi.resetAllMocks();
  api.listOrganizationTeams.mockResolvedValue([
    { id: "team-a" },
    { id: "team-b" },
  ]);
  api.deleteOrganization.mockResolvedValue({ id: "org" });
  bucket.list.mockResolvedValue({ objects: [], truncated: false });
  bucket.delete.mockResolvedValue(undefined);
  getR2.mockReturnValue({ bucket, publicUrl: "https://images.example.test" });
});

describe("deleteOrganization", () => {
  it("validates the ID and deletes through Better Auth with explicit scope", async () => {
    await expect(async () =>
      deleteOrganization({ data: { organizationId: "" } }),
    ).rejects.toThrow();
    expect(api.listOrganizationTeams).not.toHaveBeenCalled();
    expect(api.deleteOrganization).not.toHaveBeenCalled();

    await expect(
      deleteOrganization({ data: { organizationId: "org" } }),
    ).resolves.toEqual({ organizationId: "org" });
    expect(api.listOrganizationTeams).toHaveBeenCalledWith({
      headers: requestHeaders,
      query: { organizationId: "org" },
    });
    expect(api.deleteOrganization).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: { organizationId: "org" },
    });
  });

  it("removes every organization and team image prefix across R2 pages", async () => {
    bucket.list.mockImplementation(
      ({ prefix, cursor }: { prefix: string; cursor?: string }) => {
        if (prefix === "orgs/org/" && !cursor) {
          return Promise.resolve({
            objects: [{ key: "orgs/org/old.webp" }],
            truncated: true,
            cursor: "org-next",
          });
        }
        if (prefix === "orgs/org/" && cursor === "org-next") {
          return Promise.resolve({
            objects: [{ key: "orgs/org/current.webp" }],
            truncated: false,
          });
        }
        if (prefix === "teams/team-a/") {
          return Promise.resolve({
            objects: [{ key: "teams/team-a/logo.png" }],
            truncated: false,
          });
        }
        return Promise.resolve({ objects: [], truncated: false });
      },
    );

    await deleteOrganization({ data: { organizationId: "org" } });

    expect(bucket.delete).toHaveBeenNthCalledWith(1, ["orgs/org/old.webp"]);
    expect(bucket.delete).toHaveBeenNthCalledWith(2, ["orgs/org/current.webp"]);
    expect(bucket.delete).toHaveBeenNthCalledWith(3, ["teams/team-a/logo.png"]);
    expect(bucket.list).toHaveBeenCalledWith({
      prefix: "teams/team-b/",
      cursor: undefined,
      limit: 1000,
    });
    expect(api.deleteOrganization.mock.invocationCallOrder[0]).toBeLessThan(
      bucket.list.mock.invocationCallOrder[0],
    );
  });

  it("logs R2 cleanup failures and still reports successful organization deletion", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    bucket.list.mockRejectedValue(new Error("R2 unavailable"));

    await expect(
      deleteOrganization({ data: { organizationId: "org" } }),
    ).resolves.toEqual({ organizationId: "org" });

    expect(log).toHaveBeenCalledWith(
      "Could not delete organization images from R2",
      expect.objectContaining({
        organizationId: "org",
        prefix: "orgs/org/",
        error: expect.any(Error),
      }),
    );
    expect(bucket.list).toHaveBeenCalledTimes(3);
    log.mockRestore();
  });

  it("logs unavailable image storage without changing the deletion result", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    getR2.mockImplementation(() => {
      throw new Error("Image storage is not configured");
    });

    await expect(
      deleteOrganization({ data: { organizationId: "org" } }),
    ).resolves.toEqual({ organizationId: "org" });

    expect(log).toHaveBeenCalledWith(
      "Could not access R2 while deleting organization images",
      expect.objectContaining({
        organizationId: "org",
        error: expect.any(Error),
      }),
    );
    expect(bucket.list).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("does not try to clean images when Better Auth rejects deletion", async () => {
    const error = new Error("Permission denied");
    api.deleteOrganization.mockRejectedValue(error);

    await expect(
      deleteOrganization({ data: { organizationId: "org" } }),
    ).rejects.toBe(error);
    expect(bucket.list).not.toHaveBeenCalled();
  });
});
