import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { getPresignedUploadUrl } from "#/lib/storage/upload.functions";

interface imageUploadProps {
  currentImageUrl: string | null | undefined;
  onUploadComplete: (url: string) => void;
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
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
        data: {
          prefix,
          entityId,
          fileType: file.type,
          fileSize: file.size,
        },
      });
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      onUploadComplete(publicUrl);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
    onSettled: (data, error) => {
      // replace onUploadComplete with an onSettled callback
      // so that we can handle both success and error cases in the parent component (e.g. show toast notifications)
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
