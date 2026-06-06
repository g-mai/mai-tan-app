import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { Button } from "#/components/ui/button";
import {
  getPresignedUploadImgUrl,
  resizeToSquare,
} from "#/lib/storage/upload-img.functions";

interface imageUploadProps {
  currentImageUrl: string | null | undefined;
  onUploadComplete: (data: string | undefined, error: null | Error) => void;
  prefix: "avatars" | "orgs" | "teams";
  entityId: string;
  disabled?: boolean; // lock for non-admins
}

export function ImageUpload({
  currentImageUrl,
  onUploadComplete,
  prefix,
  entityId,
  disabled = false,
}: imageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (file: File) => {
      const resized = await resizeToSquare(file);
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
        variant="secondary"
        size="sm"
        disabled={isPending || disabled}
        className="w-full h-full"
        onClick={() => fileInputRef.current?.click()}
      >
        {isPending
          ? "Uploading..."
          : currentImageUrl
            ? "Change Image"
            : "Upload Image"}
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
