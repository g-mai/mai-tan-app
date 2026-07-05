import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { signUp } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export function useRegister() {
  const router = useRouter();
  const registerFormSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(2),
    email: z.email("Invalid email address"),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  });

  type RegisterFormData = z.infer<typeof registerFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: RegisterFormData) => {
      const { data: registerData, error: registerError } = await signUp.email({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`,
      });

      if (registerError) throw registerError;

      return registerData;
    },
    onSuccess: () => {
      router.navigate({ to: "/dashboard" }); // TODO: check email page
      toast.success(
        "Account created! Please check your email to verify your account.",
        {
          duration: 8000,
          position: "top-center",
        },
      );
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
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
    validators: {
      onSubmit: registerFormSchema,
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
