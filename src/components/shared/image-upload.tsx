import { useState } from "react";
import { getPresignedUploadUrl } from "#/lib/storage/upload.functions";

interface imageUploadProps {
  currentImageUrl: string | null | undefined;
  onUploadComplete: (url: string) => void;
  prefix: "avatars" | "orgs" | "teams";
  entityId: string;
  shape?: "circle" | "square"; // default: 'square'
  size?: number; // display size in px, default: 80
  disabled?: boolean; // lock for non-admins
}

export function ImageUpload({
  currentImageUrl,
  onUploadComplete,
  prefix,
  entityId,
  shape = "square",
  size = 80,
  disabled = false,
}: imageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
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
      onUploadComplete(publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`relative ${shape === "circle" ? "rounded-full" : "rounded"} w-${size} h-${size} overflow-hidden bg-gray-100`}
    >
      {currentImageUrl ? (
        <img
          src={currentImageUrl}
          alt="Current"
          // className="object-cover w-full h-full"
          width={size}
          height={size}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          <span className="text-2xl">+</span>
        </div>
      )}
      {!disabled && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      )}
    </div>
  );
}
