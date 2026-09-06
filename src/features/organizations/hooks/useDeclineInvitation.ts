import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { organization } from "#/features/auth/lib/auth-client";

export function useDeclineInvitation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await organization.rejectInvitation({ invitationId });
      if (error) throw error;
    },
    onSuccess: async () => {
      await router.invalidate();
      toast.success("Invitation declined.", {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error) => {
      console.error("Decline invitation error:", error);
      toast.error(
        error.message || "An error occurred while declining the invitation.",
        { duration: 5000, position: "top-center" },
      );
    },
  });

  return { decline: mutate, isPending };
}
