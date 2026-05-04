import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "#/hooks/form";
import { changePassword } from "#/lib/better-auth/auth-client";

export function useChangePassword() {
  const changePasswordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(8, "Password must be at least 8 characters"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

  const { mutate, isPending, isSuccess, isError, reset } = useMutation({
    mutationFn: async (values: ChangePasswordFormData) => {
      // docs: https://www.better-auth.com/docs/concepts/users-accounts#change-password
      const { data, error } = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        throw new Error(error.message || "Failed to change password");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!", {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error: Error) => {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: changePasswordSchema,
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
