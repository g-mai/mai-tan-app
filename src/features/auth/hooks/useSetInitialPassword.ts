import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { setInitialPassword } from "#/features/auth/lib/auth.functions";
import { updateUser } from "#/features/auth/lib/auth-client";
import { ONBOARDING_ROUTES } from "#/features/onboarding/lib/onboarding";
import { useAppForm } from "#/hooks/use-app-form";

export function useSetInitialPassword() {
  const router = useRouter();
  const passwordFormSchema = z
    .object({
      password: z.string().min(8, "Use at least 8 characters"),
      confirmPassword: z.string().min(8),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type PasswordFormData = z.infer<typeof passwordFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: PasswordFormData) => {
      await setInitialPassword({ data: { password: values.password } });

      const { error } = await updateUser({ onboardingStep: "profile" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await router.invalidate();
      router.navigate({ to: ONBOARDING_ROUTES.profile });
    },
    onError: (error) => {
      console.error("Set password error:", error);
      const message = error.message || "Could not set your password.";
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
    validators: {
      onSubmit: passwordFormSchema,
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
