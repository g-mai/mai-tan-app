import { useEffect, useState } from "react";
import { useAddTeamMembers } from "#/features/organizations/hooks/useAddTeamMembers";
import { useMemberSelection } from "#/features/organizations/hooks/useMemberSelection";
import {
  type MemberRow,
  memberPage,
} from "#/features/organizations/lib/member-management";
import { useDialogFocus } from "#/hooks/use-dialog-focus";

export function useTeamMemberPicker(
  teamId: string,
  candidates: MemberRow[],
  scope: string,
) {
  const focus = useDialogFocus();
  const [isOpen, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [q, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const members = memberPage(candidates, q, page);
  const selection = useMemberSelection(
    `${teamId}/${input}/${page}/${isOpen}`,
    members.rows,
  );
  const action = useAddTeamMembers({
    scope: `${teamId}/${isOpen}`,
    eligibleRows: members.rows,
    onComplete: selection.complete,
    onClose: () => setOpen(false),
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);
  useEffect(() => setPage(members.page), [members.page]);
  const [previousScope, setPreviousScope] = useState(scope);
  if (scope !== previousScope) {
    setPreviousScope(scope);
    setOpen(false);
  }
  return {
    restoreFocus: focus.restoreFocus,
    isOpen,
    input,
    setInput,
    members,
    selection,
    action,
    changing: input.trim() !== q,
    setPage,
    open: () => {
      focus.rememberFocus();
      setInput("");
      setQuery("");
      setPage(1);
      setOpen(true);
    },
    close: action.close,
    submit: () => action.submit(teamId, selection.selected),
    retry: () => action.retry(teamId, members.rows),
  };
}
