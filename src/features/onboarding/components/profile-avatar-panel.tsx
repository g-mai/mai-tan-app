import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImageUpload } from "#/components/shared/image-upload";
import { UserAvatar } from "#/features/auth/components/user-avatar";
import { updateUser } from "#/features/auth/lib/auth-client";
import type { User } from "#/features/auth/types";

/** Avatar column becomes a panel; stacks above the form on mobile. */
export function ProfileAvatarPanel({ user }: { user: User }) {
  const router = useRouter();

  async function handleImageUpload(
    url: string | undefined,
    error: Error | null,
  ) {
    try {
      if (error) throw error;
      if (!url) throw new Error("No URL returned from upload");

      const { error: updateError } = await updateUser({ image: url });
      if (updateError) throw updateError;

      await router.invalidate();
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Failed to update user image:", error);
      toast.error("Failed to update your picture. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    }
  }

  return (
    <div className="flex w-full shrink-0 flex-col items-center gap-3 rounded-lg border bg-muted p-4 sm:w-40">
      <UserAvatar user={{ ...user }} height={96} width={96} />
      <ImageUpload
        currentImageUrl={user.image}
        prefix="avatars"
        entityId={user.id}
        onUploadComplete={handleImageUpload}
        buttonText="Add a picture"
      />
    </div>
  );
}
