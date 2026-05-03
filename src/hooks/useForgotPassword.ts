import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "#/hooks/form";
import { requestPasswordReset } from "#/lib/better-auth/auth-client";

export function useForgotPassword() {
  const router = useRouter();
  const forgotPasswordFormSchema = z.object({
    email: z.email("Invalid email addresssss"),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

  const { mutate, isPending, isSuccess, isError, reset } = useMutation({
    mutationFn: async (values: ForgotPasswordFormData) => {
      const { data: signInData, error: signInError } =
        await requestPasswordReset({
          email: values.email,
          redirectTo: "/reset-password",
        });

      if (signInError) throw signInError;

      return signInData;
    },
    onSuccess: () => {
      toast.success("Password reset email sent!", {
        duration: 8000,
        position: "top-center",
      });
    },
    onError: (error) => {
      console.error("Login error:", error);
      const message = error.message || "An error occurred. Please try again.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: { onSubmit: forgotPasswordFormSchema },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  const handleReset = () => {
    form.reset();
    reset(); // Reset the mutation state
  };

  return {
    form,
    isPending,
    isSuccess,
    isError,
    handleReset,
  };
}
