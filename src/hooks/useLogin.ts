import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "#/lib/better-auth/auth-client";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      console.log("Login result:", result);

      if (result.error) {
        const err = result.error;
        throw { ...err, email: data.email };
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Logged in successfully!");
      router.navigate({ to: "/" });
    },
    onError: (error: Error & { email?: string }) => {
      // do something with the error
      console.error("Login failed:", error);
      toast.error(error.message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });
};
