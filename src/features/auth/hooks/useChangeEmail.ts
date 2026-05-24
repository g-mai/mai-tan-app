import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { changeEmail } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export function useChangeEmail(userEmail: string) {
  const changeEmailSchema = z
    .object({
      email: z.email(),
    })
    .required({ email: true });

  type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

  const { mutate, isPending, isSuccess, isError, reset } = useMutation({
    mutationFn: async (values: ChangeEmailFormData) => {
      // docs: https://www.better-auth.com/docs/concepts/users-accounts#update-user
      const { data, error } = await changeEmail({
        newEmail: values.email,
        callbackURL: "/settings",
      });

      if (error) {
        throw new Error(error.message || "Failed to update email");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Check your mailbox to confirm new Email!", {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating email:", error);
      toast.error(error.message || "Failed to change Email", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: userEmail,
    },
    validators: {
      onSubmit: changeEmailSchema,
    },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  return {
    form,
    isPending,
    isSuccess,
    isError,
    reset,
  };
}
