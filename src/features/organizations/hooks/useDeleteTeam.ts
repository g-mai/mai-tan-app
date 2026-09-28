import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTeam } from "#/features/organizations/lib/team.functions";
import { useDialogFocus } from "#/hooks/use-dialog-focus";

export function useDeleteTeam(teamId: string) {
  const focus = useDialogFocus();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const mutation = useMutation({
    mutationFn: () => deleteTeam({ data: { teamId } }),
    onSuccess: async ({ organizationId }) => {
      setIsOpen(false);
      await router.navigate({
        to: "/organizations/$orgId",
        params: { orgId: organizationId },
      });
      await router.invalidate();
      toast.success("Team deleted.");
    },
    onError: (error: Error) => {
      setError(error.message || "Could not delete this team.");
    },
  });

  return {
    restoreFocus: focus.restoreFocus,
    isOpen,
    error,
    isPending: mutation.isPending,
    open: () => {
      focus.rememberFocus();
      setError(undefined);
      setIsOpen(true);
    },
    close: () => {
      if (!mutation.isPending) {
        setError(undefined);
        setIsOpen(false);
      }
    },
    submit: () => {
      if (!mutation.isPending) {
        setError(undefined);
        mutation.mutate();
      }
    },
  };
}
