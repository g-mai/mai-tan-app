import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { uploadImage, deleteImage, resizeImgToSquare } = vi.hoisted(() => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  resizeImgToSquare: vi.fn(),
}));

vi.mock("#/lib/storage/upload-img.functions", () => ({
  uploadImage,
  deleteImage,
}));
vi.mock("#/lib/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/lib/utils")>()),
  resizeImgToSquare,
}));

import { ImageUpload } from "./image-upload";

const oldUrl = "https://images.example.com/avatars/caller/old.webp";
const newUrl = "https://images.example.com/avatars/caller/new.webp";
const resized = new File(["resized"], "avatar.webp", { type: "image/webp" });

function selectImage(onUploadComplete: () => Promise<boolean>) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const { container } = render(
    <QueryClientProvider client={client}>
      <ImageUpload
        currentImageUrl={oldUrl}
        prefix="avatars"
        entityId="caller"
        onUploadComplete={onUploadComplete}
      />
    </QueryClientProvider>,
  );
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  fireEvent.change(input as HTMLInputElement, {
    target: {
      files: [new File(["original"], "avatar.png", { type: "image/png" })],
    },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  resizeImgToSquare.mockResolvedValue(resized);
  uploadImage.mockResolvedValue({ publicUrl: newUrl });
  deleteImage.mockResolvedValue(undefined);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null)));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("image replacement", () => {
  it("waits for the image URL to be saved before deleting the old image", async () => {
    let finishSave!: (saved: boolean) => void;
    const saving = new Promise<boolean>((resolve) => {
      finishSave = resolve;
    });
    const onUploadComplete = vi.fn().mockReturnValue(saving);
    selectImage(onUploadComplete);

    await waitFor(() =>
      expect(onUploadComplete).toHaveBeenCalledWith(newUrl, null),
    );
    expect(deleteImage).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Uploading..." })).toBeDisabled();

    finishSave(true);
    await waitFor(() =>
      expect(deleteImage).toHaveBeenCalledWith({
        data: { imageUrl: oldUrl, prefix: "avatars", entityId: "caller" },
      }),
    );
  });

  it("keeps the old image when saving the replacement URL fails", async () => {
    const onUploadComplete = vi.fn().mockResolvedValue(false);
    selectImage(onUploadComplete);

    await waitFor(() =>
      expect(onUploadComplete).toHaveBeenCalledWith(newUrl, null),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Upload Image" }),
      ).toBeEnabled(),
    );
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("sends the resized file as FormData without uploading directly to R2", async () => {
    selectImage(vi.fn().mockResolvedValue(true));

    await waitFor(() => expect(uploadImage).toHaveBeenCalledOnce());
    const data = uploadImage.mock.calls[0][0].data as FormData;
    expect(data.get("prefix")).toBe("avatars");
    expect(data.get("entityId")).toBe("caller");
    expect(data.get("file")).toBe(resized);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports a storage failure without saving a URL or deleting the old image", async () => {
    const error = new Error("Failed to upload image");
    uploadImage.mockRejectedValue(error);
    const onUploadComplete = vi.fn().mockResolvedValue(false);
    selectImage(onUploadComplete);

    await waitFor(() =>
      expect(onUploadComplete).toHaveBeenCalledWith(undefined, error),
    );
    expect(onUploadComplete).toHaveBeenCalledOnce();
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("does not report a successful replacement as failed when cleanup fails", async () => {
    deleteImage.mockRejectedValue(new Error("R2 unavailable"));
    const onUploadComplete = vi.fn().mockResolvedValue(true);
    selectImage(onUploadComplete);

    await waitFor(() => expect(deleteImage).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Upload Image" }),
      ).toBeEnabled(),
    );
    expect(onUploadComplete).toHaveBeenCalledExactlyOnceWith(newUrl, null);
  });
});
