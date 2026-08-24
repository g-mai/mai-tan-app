import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { organization } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export type CreatedTeam = NonNullable<
  Awaited<ReturnType<typeof organization.createTeam>>["data"]
>;

export function useCreateTeam({
  defaultOrganizationId,
  onCreated,
}: {
  defaultOrganizationId?: string;
  onCreated?: (team: CreatedTeam) => void;
}) {
  const createTeamFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    organizationId: z.string().min(1, "Select an organization"),
  });

  type CreateTeamFormData = z.infer<typeof createTeamFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: CreateTeamFormData) => {
      const { data: team, error: createError } = await organization.createTeam({
        name: values.name,
        // Always explicit: Better Auth otherwise falls back to the session's
        // active organization, which may not be set.
        organizationId: values.organizationId,
      });

      if (createError) throw createError;
      if (!team) throw new Error("No team returned from create");

      return team;
    },
    onSuccess: (team) => {
      toast.success("Team created!", {
        duration: 5000,
        position: "top-center",
      });
      onCreated?.(team);
    },
    onError: (error) => {
      console.error("Create team error:", error);
      const message =
        error.message || "An error occurred while creating the team.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      organizationId: defaultOrganizationId ?? "",
    },
    validators: {
      onSubmit: createTeamFormSchema,
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
