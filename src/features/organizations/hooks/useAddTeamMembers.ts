import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  type BatchResult,
  type MemberFailure,
  type MemberRow,
  memberFailures,
} from "#/features/organizations/lib/member-management";
import { addTeamMembers } from "#/features/organizations/lib/member-management.functions";
import { useAppForm } from "#/hooks/use-app-form";
import { useDialogFocus } from "#/hooks/use-dialog-focus";

/** The same operation serves organization assignments and the team picker. */
export function useAddTeamMembers({
  scope,
  eligibleRows,
  onComplete,
  onClose,
}: {
  scope: string;
  eligibleRows: MemberRow[];
  onComplete: (result: BatchResult) => void;
  onClose?: () => void;
}) {
  const focus = useDialogFocus();
  const router = useRouter();
  const [targets, setTargets] = useState<MemberRow[]>([]);
  const eligibleTargets = targets.filter((target) =>
    eligibleRows.some((row) => row.userId === target.userId),
  );
  const [failures, setFailures] = useState<MemberFailure[]>([]);
  const mutation = useMutation({
    mutationFn: ({ teamId, rows }: { teamId: string; rows: MemberRow[] }) =>
      addTeamMembers({
        data: { teamId, userIds: rows.map((row) => row.userId) },
      }),
    onSuccess: async (result, { rows }) => {
      setFailures(memberFailures(result, rows));
      onComplete(result);
      await router.invalidate();
      setTargets(
        rows.filter((row) =>
          result.failed.some((failure) => failure.userId === row.userId),
        ),
      );
      if (!result.failed.length) onClose?.();
      if (result.succeeded.length)
        toast.success("Selected members are in the team.");
      if (result.failed.length)
        toast.error(`${result.failed.length} addition(s) failed.`);
    },
    onError: async (error: Error, { rows }) => {
      setFailures(
        rows.map((row) => ({
          userId: row.userId,
          label: row.email,
          code: "REQUEST_FAILED",
          message:
            error.message ||
            "Could not confirm the outcome. Refresh before retrying.",
        })),
      );
      toast.error(error.message || "Could not add members.");
      await router.invalidate();
    },
  });
  const form = useAppForm({
    defaultValues: { teamId: "" },
    validators: {
      onSubmit: z.object({ teamId: z.string().min(1, "Choose a team") }),
    },
    onSubmit: ({ value }) => {
      if (eligibleTargets.length)
        mutation.mutate({
          teamId: value.teamId,
          rows: eligibleTargets.map((row) => ({ ...row })),
        });
    },
  });
  const [previousScope, setPreviousScope] = useState(scope);
  if (scope !== previousScope) {
    setPreviousScope(scope);
    setTargets([]);
    setFailures([]);
  }
  return {
    restoreFocus: focus.restoreFocus,
    targets,
    canSubmit: eligibleTargets.length > 0,
    failures,
    form,
    isPending: mutation.isPending,
    open: (rows: MemberRow[]) => {
      focus.rememberFocus();
      setTargets(rows);
      setFailures([]);
      form.reset();
    },
    close: () => {
      if (!mutation.isPending) {
        setTargets([]);
        setFailures([]);
        onClose?.();
      }
    },
    submit: (teamId: string, rows: MemberRow[]) => {
      if (rows.length)
        mutation.mutate({ teamId, rows: rows.map((row) => ({ ...row })) });
    },
    retry: (teamId: string, eligible: MemberRow[]) => {
      const rows = eligible.filter((row) =>
        failures.some((failure) => failure.userId === row.userId),
      );
      if (rows.length)
        mutation.mutate({ teamId, rows: rows.map((row) => ({ ...row })) });
    },
  };
}
