import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { Button } from "#/components/ui/button";
import {
  deleteImage,
  getPresignedUploadImgUrl,
} from "#/lib/storage/upload-img.functions";
import { resizeImgToSquare } from "#/lib/utils";

interface imageUploadProps {
  currentImageUrl: string | null | undefined;
  onUploadComplete: (data: string | undefined, error: null | Error) => void;
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

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (file: File) => {
      const resized = await resizeImgToSquare(file);
      const { uploadUrl, publicUrl } = await getPresignedUploadImgUrl({
        data: {
          prefix,
          entityId,
          fileType: resized.type,
          fileSize: resized.size,
        },
      });
      await fetch(uploadUrl, {
        method: "PUT",
        body: resized,
      });
      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      // TODO: if currentImageUrl exist, delete old picture
      if (currentImageUrl) {
        deleteImage({
          data: {
            imageUrl: currentImageUrl,
            prefix,
            entityId,
          },
        });
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
    onSettled: (data, error) => {
      onUploadComplete(data, error as Error | null);
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
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
