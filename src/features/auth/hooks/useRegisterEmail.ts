import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { emailOtp } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export function useRegisterEmail({
  defaultEmail,
}: {
  defaultEmail?: string;
} = {}) {
  const router = useRouter();
  const registerEmailFormSchema = z.object({
    email: z.email("Invalid email address"),
  });

  type RegisterEmailFormData = z.infer<typeof registerEmailFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: RegisterEmailFormData) => {
      const { data, error } = await emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      });

      if (error) throw error;

      return { ...data, email: values.email };
    },
    onSuccess: ({ email }) => {
      router.navigate({ to: "/register/verify", search: { email } });
    },
    onError: (error) => {
      console.error("Registration error:", error);
      const message = error.message || "Could not send the verification code.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: defaultEmail ?? "",
    },
    validators: {
      onSubmit: registerEmailFormSchema,
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
  };
}
