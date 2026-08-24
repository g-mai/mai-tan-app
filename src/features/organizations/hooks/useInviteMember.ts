import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { organization } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export type SentInvitation = NonNullable<
  Awaited<ReturnType<typeof organization.inviteMember>>["data"]
>;

function inviteErrorMessage(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION":
      return "That person is already a member of this organization.";
    case "USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION":
      return "They already have a pending invitation — resend it instead.";
    case "YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION":
      return "Only owners and admins can invite people.";
    default:
      return error.message || "An error occurred while sending the invitation.";
  }
}

export function useInviteMember({
  organizationId,
  onInvited,
}: {
  organizationId: string;
  onInvited?: (invitation: SentInvitation) => void;
}) {
  const router = useRouter();

  const inviteFormSchema = z.object({
    email: z.email("Invalid email address"),
    role: z.enum(["member", "admin"]),
  });

  type InviteFormData = z.infer<typeof inviteFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: InviteFormData) => {
      const { data: invitation, error: inviteError } =
        await organization.inviteMember({
          email: values.email,
          role: values.role,
          organizationId,
        });

      if (inviteError) throw inviteError;
      if (!invitation) throw new Error("No invitation returned from invite");

      return invitation;
    },
    onSuccess: async (invitation) => {
      await router.invalidate();
      toast.success(`Invitation sent to ${invitation.email}`, {
        duration: 5000,
        position: "top-center",
      });
      onInvited?.(invitation);
    },
    onError: (error) => {
      console.error("Invite member error:", error);
      toast.error(inviteErrorMessage(error), {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      role: "member" as "member" | "admin",
    },
    validators: {
      onSubmit: inviteFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      mutate(value, { onSuccess: () => formApi.reset() });
    },
  });

  return {
    form,
    isPending,
    isSuccess,
    isError,
  };
}
