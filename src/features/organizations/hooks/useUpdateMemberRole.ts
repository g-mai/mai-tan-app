import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  type MemberRow,
  type OrganizationRole,
  organizationRoleSchema,
} from "#/features/organizations/lib/member-management";
import { updateOrganizationMemberRole } from "#/features/organizations/lib/member-management.functions";
import { hasRole } from "#/features/organizations/lib/org";
import { useAppForm } from "#/hooks/use-app-form";
import { useDialogFocus } from "#/hooks/use-dialog-focus";

export function useUpdateMemberRole(organizationId: string, scope: string) {
  const focus = useDialogFocus();
  const router = useRouter();
  const [target, setTarget] = useState<MemberRow | null>(null);
  const [error, setError] = useState<string>();
  const mutation = useMutation({
    mutationFn: (values: { target: MemberRow; role: OrganizationRole }) =>
      updateOrganizationMemberRole({
        data: {
          organizationId,
          memberId: values.target.memberId,
          role: values.role,
        },
      }),
    onSuccess: async () => {
      await router.invalidate();
      setTarget(null);
      toast.success("Organization role changed.");
    },
    onError: async (error: Error) => {
      setError(error.message);
      toast.error(error.message || "Could not change the role.");
      await router.invalidate();
    },
  });
  const form = useAppForm({
    defaultValues: {
      role: (hasRole(target?.role, "owner")
        ? "owner"
        : hasRole(target?.role, "admin")
          ? "admin"
          : "member") as OrganizationRole,
    },
    validators: { onSubmit: z.object({ role: organizationRoleSchema }) },
    onSubmit: ({ value }) => {
      if (target && value.role !== target.role)
        mutation.mutate({ target: { ...target }, role: value.role });
    },
  });
  const [previousScope, setPreviousScope] = useState(scope);
  if (scope !== previousScope) {
    setPreviousScope(scope);
    setTarget(null);
    setError(undefined);
  }
  return {
    restoreFocus: focus.restoreFocus,
    target,
    error,
    form,
    isPending: mutation.isPending,
    open: (row: MemberRow) => {
      focus.rememberFocus();
      setTarget(row);
      setError(undefined);
      form.reset({
        role: hasRole(row.role, "owner")
          ? "owner"
          : hasRole(row.role, "admin")
            ? "admin"
            : "member",
      });
    },
    close: () => {
      if (!mutation.isPending) setTarget(null);
    },
  };
}
