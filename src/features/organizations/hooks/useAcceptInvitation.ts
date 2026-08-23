import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { organization } from "#/features/auth/lib/auth-client";

export type AcceptedInvitation = NonNullable<
  Awaited<ReturnType<typeof organization.acceptInvitation>>["data"]
>;

function acceptErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION":
      return "This invitation was sent to a different email address.";
    case "INVITATION_NOT_FOUND":
      return "This invitation is no longer valid. Ask for a new one.";
    default:
      return (
        error.message || "An error occurred while accepting the invitation."
      );
  }
}

/**
 * Accepting also sets the organization active and joins the invitation's team,
 * so the caller only has to decide where to go next.
 */
export function useAcceptInvitation({
  onAccepted,
}: {
  onAccepted?: (accepted: AcceptedInvitation) => void;
} = {}) {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await organization.acceptInvitation({
        invitationId,
      });

      if (error) throw error;
      if (!data) throw new Error("No invitation returned from accept");

      return data;
    },
    onSuccess: async (accepted) => {
      await router.invalidate();
      toast.success("Invitation accepted!", {
        duration: 5000,
        position: "top-center",
      });
      onAccepted?.(accepted);
    },
    onError: (error) => {
      console.error("Accept invitation error:", error);
      toast.error(acceptErrorMessage(error), {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  return { accept: mutate, isPending };
}
