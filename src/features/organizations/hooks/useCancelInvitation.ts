import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { organization } from "#/features/auth/lib/auth-client";

export function useCancelInvitation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await organization.cancelInvitation({ invitationId });
      if (error) throw error;
    },
    onSuccess: async () => {
      await router.invalidate();
      toast.success("Invitation cancelled.", {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error) => {
      console.error("Cancel invitation error:", error);
      toast.error(
        error.message || "An error occurred while cancelling the invitation.",
        { duration: 5000, position: "top-center" },
      );
    },
  });

  return { cancel: mutate, isPending };
}
