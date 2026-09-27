import { useEffect, useRef, useState } from "react";
import {
  type BatchResult,
  type MemberRow,
  retainFailedSelection,
} from "#/features/organizations/lib/member-management";

export function useMemberSelection(scope: string, rows: MemberRow[]) {
  const [selection, setSelection] = useState<{ scope: string; ids: string[] }>({
    scope,
    ids: [],
  });
  const ids =
    selection.scope === scope
      ? selection.ids.filter((id) => rows.some((row) => row.userId === id))
      : [];
  if (selection.scope !== scope || selection.ids.length !== ids.length)
    setSelection({ scope, ids });
  const selected = rows.filter((row) => ids.includes(row.userId));
  return {
    ids,
    selected,
    toggle: (userId: string) =>
      setSelection({
        scope,
        ids: ids.includes(userId)
          ? ids.filter((id) => id !== userId)
          : [...ids, userId],
      }),
    toggleAll: () =>
      setSelection({
        scope,
        ids: ids.length === rows.length ? [] : rows.map((row) => row.userId),
      }),
    complete: (result: BatchResult) =>
      setSelection({ scope, ids: retainFailedSelection(result, rows) }),
  };
}

/** Shared URL search coordination for the two main lists. */
export function useMemberSearch({
  q,
  page,
  effectivePage,
  change,
}: {
  q: string;
  page: number;
  effectivePage: number;
  change: (search: { q: string; page: number }, replace: boolean) => void;
}) {
  const [input, setInput] = useState(q);
  const pendingQueries = useRef<string[]>([]);
  useEffect(() => {
    const index = pendingQueries.current.lastIndexOf(q);
    if (index === -1) {
      pendingQueries.current = [];
      setInput(q);
    } else {
      // A completed search must not overwrite typing that happened after it.
      pendingQueries.current.splice(0, index + 1);
      setInput((current) => (current.trim() === q ? q : current));
    }
  }, [q]);
  useEffect(() => {
    if (input.trim() === q) return;
    const timer = setTimeout(() => {
      const query = input.trim();
      pendingQueries.current.push(query);
      change({ q: query, page: 1 }, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, q, change]);
  useEffect(() => {
    if (effectivePage !== page) change({ q, page: effectivePage }, true);
  }, [effectivePage, page, q, change]);
  return { input, setInput, changing: input.trim() !== q };
}
