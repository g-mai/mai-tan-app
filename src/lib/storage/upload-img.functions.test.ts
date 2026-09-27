import { beforeEach, describe, expect, it, vi } from "vitest";

const { bucket, getR2, hasPermission, teamRead, requestHeaders } = vi.hoisted(
  () => ({
    bucket: { put: vi.fn(), delete: vi.fn() },
    getR2: vi.fn(),
    hasPermission: vi.fn(),
    teamRead: vi.fn(),
    requestHeaders: new Headers({ cookie: "session" }),
  }),
);

vi.mock("#/lib/storage/r2.server", () => ({ getR2 }));
vi.mock("#/features/auth/lib/auth", () => ({
  auth: { api: { hasPermission } },
}));
vi.mock("#/features/auth/middleware", () => ({
  authMiddleware: "authenticated",
}));
vi.mock("#/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => ({ limit: teamRead }) }),
    }),
  },
}));
vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeaders: () => requestHeaders,
}));
// Exercise the function validators and handlers without the Worker transport.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validator:
      | ((data: unknown) => unknown)
      | { parse: (data: unknown) => unknown };
    const builder = {
      middleware: () => builder,
      validator: (value: typeof validator) => {
        validator = value;
        return builder;
      },
      handler:
        (fn: (args: unknown) => unknown) =>
        async ({ data }: { data: unknown }) =>
          fn({
            data:
              typeof validator === "function"
                ? validator(data)
                : validator.parse(data),
            context: { session: { user: { id: "caller" } } },
          }),
    };
    return builder;
  },
}));

import { deleteImage, uploadImage } from "./upload-img.functions";

const publicUrl = "https://images.example.com";

function uploadData(
  prefix = "avatars",
  entityId = "caller",
  file: File | string = new File(["image"], "avatar.webp", {
    type: "image/webp",
  }),
) {
  const data = new FormData();
  data.set("prefix", prefix);
  data.set("entityId", entityId);
  data.set("file", file);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  getR2.mockReturnValue({ bucket, publicUrl });
  bucket.put.mockResolvedValue({});
  bucket.delete.mockResolvedValue(undefined);
  hasPermission.mockResolvedValue({ success: true });
  teamRead.mockResolvedValue([{ id: "team", organizationId: "org" }]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("native image uploads", () => {
  it("stores the received file with its content type and returns the public URL", async () => {
    const data = uploadData();
    const result = await uploadImage({ data });
    const key = bucket.put.mock.calls[0][0];

    expect(key).toMatch(/^avatars\/caller\/[\w-]+\.webp$/);
    expect(bucket.put).toHaveBeenCalledExactlyOnceWith(key, data.get("file"), {
      httpMetadata: { contentType: "image/webp" },
    });
    expect(result).toEqual({ publicUrl: `${publicUrl}/${key}` });
  });

  it.each([
    ["empty", new File([], "empty.webp", { type: "image/webp" })],
    [
      "unsupported",
      new File(["image"], "image.svg", { type: "image/svg+xml" }),
    ],
    ["missing file", "not-a-file"],
    [
      "oversized",
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.webp", {
        type: "image/webp",
      }),
    ],
  ])("rejects %s files before writing to R2", async (_, file) => {
    const data = uploadData("avatars", "caller", file);
    data.set("fileSize", "1");
    data.set("fileType", "image/webp");

    await expect(uploadImage({ data })).rejects.toThrow();
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it.each(["invalid", ""])("rejects the invalid prefix %s", async (prefix) => {
    await expect(uploadImage({ data: uploadData(prefix) })).rejects.toThrow();
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it("rejects an avatar upload for another user", async () => {
    await expect(
      uploadImage({ data: uploadData("avatars", "other") }),
    ).rejects.toThrow("Unauthorized");
    expect(getR2).not.toHaveBeenCalled();
  });

  it("checks organization update permission before storing a logo", async () => {
    await uploadImage({ data: uploadData("orgs", "org") });
    expect(hasPermission).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: {
        organizationId: "org",
        permissions: { organization: ["update"] },
      },
    });

    bucket.put.mockClear();
    hasPermission.mockResolvedValue({ success: false });
    await expect(
      uploadImage({ data: uploadData("orgs", "org") }),
    ).rejects.toThrow("Unauthorized");
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it("checks team update permission in the team's organization", async () => {
    await uploadImage({ data: uploadData("teams", "team") });
    expect(hasPermission).toHaveBeenCalledWith({
      headers: requestHeaders,
      body: { organizationId: "org", permissions: { team: ["update"] } },
    });

    bucket.put.mockClear();
    hasPermission.mockResolvedValue({ success: false });
    await expect(
      uploadImage({ data: uploadData("teams", "team") }),
    ).rejects.toThrow("Unauthorized");
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it("rejects uploads for a missing team", async () => {
    teamRead.mockResolvedValue([]);
    await expect(
      uploadImage({ data: uploadData("teams", "missing") }),
    ).rejects.toThrow("Team not found");
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it("does not return an image URL when R2 rejects the write", async () => {
    bucket.put.mockRejectedValue(new Error("R2 unavailable"));
    await expect(uploadImage({ data: uploadData() })).rejects.toThrow(
      "Failed to upload image",
    );
  });
});

describe("image deletion", () => {
  it("deletes an owned image using the object key relative to the public base", async () => {
    getR2.mockReturnValue({
      bucket,
      publicUrl: "http://localhost:3000/api/images",
    });
    await deleteImage({
      data: {
        prefix: "avatars",
        entityId: "caller",
        imageUrl: "http://localhost:3000/api/images/avatars/caller/old.webp",
      },
    });
    expect(bucket.delete).toHaveBeenCalledExactlyOnceWith(
      "avatars/caller/old.webp",
    );
  });

  it.each([
    "avatars/other/old.webp",
    "orgs/caller/old.webp",
    "avatars/caller/nested/old.webp",
    "avatars/caller/..%2Fother%2Fold.webp",
  ])(
    "rejects an object key outside the authorized directory: %s",
    async (key) => {
      await expect(
        deleteImage({
          data: {
            prefix: "avatars",
            entityId: "caller",
            imageUrl: `${publicUrl}/${key}`,
          },
        }),
      ).rejects.toThrow("Unauthorized");
      expect(bucket.delete).not.toHaveBeenCalled();
    },
  );

  it("rejects deleting an image on behalf of another user", async () => {
    await expect(
      deleteImage({
        data: {
          prefix: "avatars",
          entityId: "other",
          imageUrl: `${publicUrl}/avatars/other/old.webp`,
        },
      }),
    ).rejects.toThrow("Unauthorized");
    expect(bucket.delete).not.toHaveBeenCalled();
  });

  it("skips external images", async () => {
    await deleteImage({
      data: {
        prefix: "avatars",
        entityId: "caller",
        imageUrl: "https://oauth.example.com/avatars/caller/photo.webp",
      },
    });
    expect(bucket.delete).not.toHaveBeenCalled();
  });

  it("skips images outside the configured public base path", async () => {
    getR2.mockReturnValue({
      bucket,
      publicUrl: "http://localhost:3000/api/images",
    });
    await deleteImage({
      data: {
        prefix: "avatars",
        entityId: "caller",
        imageUrl:
          "http://localhost:3000/api/images-other/avatars/caller/old.webp",
      },
    });
    expect(bucket.delete).not.toHaveBeenCalled();
  });

  it("reports storage failures", async () => {
    bucket.delete.mockRejectedValue(new Error("R2 unavailable"));
    await expect(
      deleteImage({
        data: {
          prefix: "avatars",
          entityId: "caller",
          imageUrl: `${publicUrl}/avatars/caller/old.webp`,
        },
      }),
    ).rejects.toThrow("Failed to delete image");
  });
});
