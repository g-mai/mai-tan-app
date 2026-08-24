import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { organization } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export type CreatedOrganization = NonNullable<
  Awaited<ReturnType<typeof organization.create>>["data"]
>;

export function useCreateOrg({
  onCreated,
}: {
  onCreated: (org: CreatedOrganization) => void;
}) {
  const createOrgFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and dashes"),
  });

  const router = useRouter();

  type CreateOrgFormData = z.infer<typeof createOrgFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: CreateOrgFormData) => {
      const { data: org, error: createError } = await organization.create({
        name: values.name,
        slug: values.slug,
      });

      if (createError) throw createError;
      if (!org) throw new Error("No organization returned from create");

      return org;
    },
    onSuccess: async (org) => {
      // refreshes cookie cache
      await organization.setActive({ organizationId: org.id });
      await router.invalidate();
      toast.success("Organization created!", {
        duration: 5000,
        position: "top-center",
      });
      // What happens next is the caller's call: the onboarding flow advances a
      // step, /organizations/new swaps in <EditOrg>.
      onCreated(org);
    },
    onError: (error) => {
      console.error("Create organization error:", error);
      const message =
        error.message || "An error occurred while creating the organization.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validators: {
      onSubmit: createOrgFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      mutate(value, {
        onSuccess: () => formApi.reset(),
      });
    },
  });

  return {
    form,
    isPending,
    isSuccess,
    isError,
  };
}
