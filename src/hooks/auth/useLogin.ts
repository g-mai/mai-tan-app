import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "#/hooks/form";
import { signIn } from "#/lib/better-auth/auth-client";

export function useLogin() {
  const router = useRouter();
  const loginFormSchema = z.object({
    email: z.email("Invalid email addresssss"),
    password: z.string().min(6),
  });

  type LoginFormData = z.infer<typeof loginFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: LoginFormData) => {
      const { data: signInData, error: signInError } = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (signInError) throw signInError;

      return signInData;
    },
    onSuccess: () => {
      router.navigate({ to: "/" });
      toast.success("Successfully logged in!");
    },
    onError: (error) => {
      console.error("Login error:", error);
      const message = error.message || "An error occurred during login.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: { onSubmit: loginFormSchema },
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
