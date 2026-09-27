import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { Button } from "#/components/ui/button";
import { deleteImage, uploadImage } from "#/lib/storage/upload-img.functions";
import { resizeImgToSquare } from "#/lib/utils";

interface imageUploadProps {
  currentImageUrl: string | null | undefined;
  onUploadComplete: (
    data: string | undefined,
    error: null | Error,
  ) => Promise<boolean>;
  prefix: "avatars" | "orgs" | "teams";
  entityId: string;
  disabled?: boolean; // lock for non-admins
  buttonText?: string;
}

export function ImageUpload({
  currentImageUrl,
  onUploadComplete,
  prefix,
  entityId,
  disabled = false,
  buttonText = "Upload Image",
}: imageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const resized = await resizeImgToSquare(file);
      const data = new FormData();
      data.set("prefix", prefix);
      data.set("entityId", entityId);
      data.set("file", resized);
      const { publicUrl } = await uploadImage({ data });
      return publicUrl;
    },
    onSuccess: async (publicUrl) => {
      const saved = await onUploadComplete(publicUrl, null);
      if (saved && currentImageUrl && currentImageUrl !== publicUrl) {
        try {
          await deleteImage({
            data: {
              imageUrl: currentImageUrl,
              prefix,
              entityId,
            },
          });
        } catch (error) {
          console.error("Failed to delete previous image:", error);
        }
      }
    },
    onError: async (error) => {
      console.error("Upload failed:", error);
      await onUploadComplete(undefined, error);
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    mutate(file);
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending || disabled}
        className="w-full h-full"
        onClick={() => fileInputRef.current?.click()}
      >
        {isPending ? "Uploading..." : buttonText}
      </Button>
      {!disabled && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
          className="hidden"
        />
      )}
    </div>
  );
}
