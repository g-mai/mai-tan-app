import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { organization } from "#/features/auth/lib/auth-client";
import type { CreatedOrganization } from "#/features/organizations/hooks/useCreateOrg";
import { useAppForm } from "#/hooks/use-app-form";

export function useUpdateOrg(org: CreatedOrganization) {
  const updateOrgFormSchema = z.object({
    description: z.string(),
    website: z.literal("").or(z.url("Invalid URL")),
    address: z.string(),
    postCode: z.string(),
    country: z.string(),
    phone: z.string(),
  });

  type UpdateOrgFormData = z.infer<typeof updateOrgFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: UpdateOrgFormData) => {
      const { data, error: updateError } = await organization.update({
        organizationId: org.id,
        data: values,
      });

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      toast.success("Organization saved!", {
        duration: 5000,
        position: "top-center",
      });
      // Hard navigation so SSR re-fetches the session with the new org included.
      // The session cookie cache would otherwise keep serving a stale org list.
      window.location.href = `/organizations/${org.id}`;
    },
    onError: (error) => {
      console.error("Update organization error:", error);
      const message =
        error.message || "An error occurred while saving the organization.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      description: org.description ?? "",
      website: org.website ?? "",
      address: org.address ?? "",
      postCode: org.postCode ?? "",
      country: org.country ?? "",
      phone: org.phone ?? "",
    },
    validators: {
      onSubmit: updateOrgFormSchema,
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
