import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { organization } from "#/features/auth/lib/auth-client";

/**
 * `resend: true` reuses the existing invitation row and only pushes `expiresAt`
 * out, so the link already in the recipient's inbox stays valid.
 */
export function useResendInvitation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      email,
      role,
      organizationId,
    }: {
      email: string;
      role: string;
      organizationId: string;
    }) => {
      const { error } = await organization.inviteMember({
        email,
        // The stored column is a plain string; the client types it as the role
        // union. We're echoing back a role Better Auth itself wrote.
        role: role as Parameters<typeof organization.inviteMember>[0]["role"],
        organizationId,
        resend: true,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await router.invalidate();
      toast.success("Invitation sent again.", {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error) => {
      console.error("Resend invitation error:", error);
      toast.error(
        error.message || "An error occurred while resending the invitation.",
        { duration: 5000, position: "top-center" },
      );
    },
  });

  return { resend: mutate, isPending };
}
