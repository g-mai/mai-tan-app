import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "#/hooks/form";
import { resetPassword } from "#/lib/better-auth/auth-client";

export function useResetPassword(token: string) {
  const router = useRouter();

  const resetPasswordFormSchema = z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

  const { mutate, isPending, isSuccess, isError, reset } = useMutation({
    mutationFn: async (values: ResetPasswordFormData) => {
      const { data, error } = await resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully! You can now log in.", {
        duration: 8000,
        position: "top-center",
      });
      router.navigate({ to: "/login" });
    },
    onError: (error) => {
      // TODO: if error.code === INVALID_TOKEN, do something specific
      console.error("Reset password error:", error);
      const message = error.message || "An error occurred. Please try again.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: { onSubmit: resetPasswordFormSchema },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  const handleReset = () => {
    form.reset();
    reset();
  };

  return {
    form,
    isPending,
    isSuccess,
    isError,
    handleReset,
  };
}
