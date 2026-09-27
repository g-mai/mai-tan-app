import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { bucket, getR2, route } = vi.hoisted(() => ({
  bucket: { get: vi.fn() },
  getR2: vi.fn(),
  route: {
    GET: undefined as unknown as (args: {
      params: { _splat: string };
    }) => Promise<Response>,
  },
}));

vi.mock("#/lib/storage/r2.server", () => ({ getR2 }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { server: { handlers: typeof route } }) => {
    route.GET = options.server.handlers.GET;
    return options;
  },
}));

import "#/routes/api/images/$";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("DEV", true);
  getR2.mockReturnValue({ bucket });
});

afterEach(() => vi.unstubAllEnvs());

describe("local image previews", () => {
  it("serves object bytes with the stored content type and ETag", async () => {
    bucket.get.mockResolvedValue({
      body: new Uint8Array([1, 2, 3]),
      httpEtag: '"image-etag"',
      writeHttpMetadata: (headers: Headers) =>
        headers.set("content-type", "image/webp"),
    });
    const response = await route.GET({
      params: { _splat: "avatars/caller/image.webp" },
    });

    expect(bucket.get).toHaveBeenCalledWith("avatars/caller/image.webp");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("etag")).toBe('"image-etag"');
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([
      1, 2, 3,
    ]);
  });

  it("returns 404 for missing objects", async () => {
    bucket.get.mockResolvedValue(null);
    const response = await route.GET({
      params: { _splat: "avatars/caller/missing.webp" },
    });
    expect(response.status).toBe(404);
  });

  it("does not expose the preview route in production", async () => {
    vi.stubEnv("DEV", false);
    const response = await route.GET({
      params: { _splat: "avatars/caller/image.webp" },
    });
    expect(response.status).toBe(404);
    expect(getR2).not.toHaveBeenCalled();
  });
});
