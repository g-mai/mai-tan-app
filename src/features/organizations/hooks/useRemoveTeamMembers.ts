import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  type BatchResult,
  type MemberFailure,
  type MemberRow,
  memberFailures,
} from "#/features/organizations/lib/member-management";
import { removeTeamMembers } from "#/features/organizations/lib/member-management.functions";
import { useDialogFocus } from "#/hooks/use-dialog-focus";

export function useRemoveTeamMembers({
  teamId,
  userId,
  scope,
  onComplete,
}: {
  teamId: string;
  userId: string;
  scope: string;
  onComplete: (result: BatchResult) => void;
}) {
  const focus = useDialogFocus();
  const router = useRouter();
  const [targets, setTargets] = useState<MemberRow[]>([]);
  const [failures, setFailures] = useState<MemberFailure[]>([]);
  const mutation = useMutation({
    mutationFn: (rows: MemberRow[]) =>
      removeTeamMembers({
        data: { teamId, userIds: rows.map((row) => row.userId) },
      }),
    onSuccess: async (result, rows) => {
      setFailures(memberFailures(result, rows));
      onComplete(result);
      if (result.succeeded.includes(userId))
        await router.navigate({
          to: "/teams/$teamId",
          params: { teamId },
          state: { memberManagementFailures: memberFailures(result, rows) },
        });
      await router.invalidate();
      setTargets([]);
      if (result.succeeded.length)
        toast.success(
          `${result.succeeded.length} member(s) removed from the team.`,
        );
      if (result.skipped.length)
        toast.info(`${result.skipped.length} member(s) were already absent.`);
      if (result.failed.length)
        toast.error(`${result.failed.length} removal(s) failed.`);
    },
    onError: async (error: Error, rows) => {
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
      toast.error(error.message || "Could not remove members.");
      await router.invalidate();
      setTargets([]);
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
    failures,
    isPending: mutation.isPending,
    open: (rows: MemberRow[]) => {
      focus.rememberFocus();
      setTargets(rows);
    },
    close: () => {
      if (!mutation.isPending) setTargets([]);
    },
    submit: () => {
      if (targets.length) mutation.mutate(targets.map((row) => ({ ...row })));
    },
    retry: (eligible: MemberRow[]) => {
      const rows = eligible.filter((row) =>
        failures.some((failure) => failure.userId === row.userId),
      );
      if (rows.length) setTargets(rows);
    },
  };
}
