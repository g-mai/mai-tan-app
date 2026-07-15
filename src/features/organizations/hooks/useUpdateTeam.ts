import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { organization } from "#/features/auth/lib/auth-client";
import { useAppForm } from "#/hooks/use-app-form";

export type EditableTeam = {
  id: string;
  name: string;
  organizationId: string;
  description?: string | null;
  color?: string | null;
  logo?: string | null;
};

export const DEFAULT_TEAM_COLOR = "#17967f";

export function useUpdateTeam(team: EditableTeam) {
  const router = useRouter();
  const navigate = useNavigate();

  const updateTeamFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color, e.g. #17967f"),
  });

  type UpdateTeamFormData = z.infer<typeof updateTeamFormSchema>;

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (values: UpdateTeamFormData) => {
      const { data, error: updateError } = await organization.updateTeam({
        teamId: team.id,
        // organizationId travels inside `data` — Better Auth reads it from
        // there, and falls back to the (possibly unset) active org without it.
        data: { ...values, organizationId: team.organizationId },
      });

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: async () => {
      toast.success("Team saved!", {
        duration: 5000,
        position: "top-center",
      });
      await router.invalidate();
      navigate({ to: "/teams/$teamId", params: { teamId: team.id } });
    },
    onError: (error) => {
      console.error("Update team error:", error);
      const message =
        error.message || "An error occurred while saving the team.";
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: team.name,
      description: team.description ?? "",
      color: team.color || DEFAULT_TEAM_COLOR,
    },
    validators: {
      onSubmit: updateTeamFormSchema,
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
