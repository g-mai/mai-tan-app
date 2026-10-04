import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { deleteOrganization } from "#/features/organizations/lib/org.functions";
import { useDialogFocus } from "#/hooks/use-dialog-focus";

export function useDeleteOrganization(organizationId: string) {
  const focus = useDialogFocus();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const mutation = useMutation({
    mutationFn: () => deleteOrganization({ data: { organizationId } }),
    onSuccess: async () => {
      setIsOpen(false);
      await router.navigate({ to: "/organizations", replace: true });
      await router.invalidate({ sync: true });
      toast.success("Organization deleted.");
    },
    onError: (error: Error) => {
      setError(error.message || "Could not delete this organization.");
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
