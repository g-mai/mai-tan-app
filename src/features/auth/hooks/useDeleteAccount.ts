import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { deleteUser } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export function useDeleteAccount() {
  const router = useRouter();

  const deleteAccountSchema = z.object({
    password: z.string().min(1, "Enter your password to confirm"),
  });

  type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: DeleteAccountFormData) => {
      const { data, error } = await deleteUser({ password: values.password });

      if (error) {
        // beforeDelete failures arrive here too, and their message is the
        // actionable one — pass it through untouched.
        throw new Error(
          error.code === "INVALID_PASSWORD"
            ? "That password isn't right."
            : error.message || "Failed to delete your account",
        );
      }

      return data;
    },
    onSuccess: async () => {
      // The endpoint already deleted the sessions and cleared the cookie, so
      // there is nothing left to sign out of.
      await router.invalidate();
      router.navigate({ to: "/" });
      toast.success("Your account has been permanently deleted.", {
        duration: 8000,
        position: "top-center",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete your account", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: deleteAccountSchema,
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
