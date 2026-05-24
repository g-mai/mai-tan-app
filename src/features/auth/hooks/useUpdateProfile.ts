import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { updateUser } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export function useUpdateProfile(initialData?: {
  firstName?: string | null;
  lastName?: string | null;
}) {
  const profileUpdateSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  });

  type ProfileFormData = z.infer<typeof profileUpdateSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: ProfileFormData) => {
      // docs: https://www.better-auth.com/docs/concepts/users-accounts#update-user
      const { data, error } = await updateUser({
        name: `${values.firstName} ${values.lastName}`,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Profile update error:", error);
      toast.error(error.message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
    },
    validators: {
      onSubmit: profileUpdateSchema,
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
