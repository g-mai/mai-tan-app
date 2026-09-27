import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MemberRow } from "#/features/organizations/lib/member-management";

const {
  add,
  removeOrg,
  removeTeam,
  updateRole,
  invalidate,
  navigate,
  success,
  error,
} = vi.hoisted(() => ({
  add: vi.fn(),
  removeOrg: vi.fn(),
  removeTeam: vi.fn(),
  updateRole: vi.fn(),
  invalidate: vi.fn(),
  navigate: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("#/features/organizations/lib/member-management.functions", () => ({
  addTeamMembers: add,
  removeOrganizationMembers: removeOrg,
  removeTeamMembers: removeTeam,
  updateOrganizationMemberRole: updateRole,
}));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ invalidate, navigate }),
}));
vi.mock("sonner", () => ({ toast: { success, error, info: vi.fn() } }));

import { MemberTable } from "#/features/organizations/components/member-table";
import { RemoveMembersDialog } from "#/features/organizations/components/remove-members-dialog";
import { useDialogFocus } from "#/hooks/use-dialog-focus";
import { useAddTeamMembers } from "./useAddTeamMembers";
import { useMemberSearch, useMemberSelection } from "./useMemberSelection";
import { useRemoveOrganizationMembers } from "./useRemoveOrganizationMembers";
import { useRemoveTeamMembers } from "./useRemoveTeamMembers";
import { useTeamMemberPicker } from "./useTeamMemberPicker";
import { useUpdateMemberRole } from "./useUpdateMemberRole";

const rows: MemberRow[] = ["self", "other"].map((userId) => ({
  userId,
  memberId: `m-${userId}`,
  name: userId,
  email: `${userId}@test.com`,
  image: null,
  role: "admin",
}));
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  invalidate.mockResolvedValue(undefined);
  navigate.mockResolvedValue(undefined);
});

describe("member table and confirmations", () => {
  it("shows organization roles and the caller without exposing controls to read-only users", () => {
    render(<MemberTable rows={rows} userId="self" emptyMessage="Empty" />);
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Organization role")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("selects visible rows only and provides indeterminate select-all", () => {
    const toggleAll = vi.fn();
    render(
      <MemberTable
        rows={rows}
        userId="self"
        selection={{ ids: ["self"], toggle: vi.fn(), toggleAll }}
        emptyMessage="Empty"
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: "Select all members on this page" }),
    ).toHaveAttribute("aria-checked", "mixed");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select all members on this page" }),
    );
    expect(toggleAll).toHaveBeenCalledOnce();
  });
  it("cancel performs no mutation and pending disables confirmation and dismissal", () => {
    const onClose = vi.fn(),
      onSubmit = vi.fn();
    const props = {
      targets: rows,
      scopeName: "Example",
      organization: true,
      excluded: 1,
      isPending: false,
      onClose,
      onSubmit,
      restoreFocus: vi.fn(),
    };
    const view = render(<RemoveMembersDialog {...props} />);
    expect(
      screen.getByText(/also removes them from this organization’s teams/),
    ).toBeInTheDocument();
    expect(screen.getByText(/selected owner/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
    view.rerender(<RemoveMembersDialog {...props} isPending />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Removing…" })).toBeDisabled();
  });
});

describe("selection and URL search coordination", () => {
  it("clears selection when the query/page/tab scope changes and on select-all toggling", () => {
    const { result, rerender } = renderHook(
      ({ scope }) => useMemberSelection(scope, rows),
      { initialProps: { scope: "org/q/1/members" } },
    );
    act(() => result.current.toggleAll());
    expect(result.current.ids).toEqual(["self", "other"]);
    act(() => result.current.toggleAll());
    expect(result.current.ids).toEqual([]);
    act(() => result.current.toggle("self"));
    rerender({ scope: "org/q/2/members" });
    expect(result.current.ids).toEqual([]);
  });
  it("forgets selections removed by refreshed data", () => {
    const { result, rerender } = renderHook(
      ({ visible }) => useMemberSelection("scope", visible),
      { initialProps: { visible: rows } },
    );
    act(() => result.current.toggle("self"));
    rerender({ visible: [rows[1]] });
    expect(result.current.ids).toEqual([]);
    rerender({ visible: rows });
    expect(result.current.ids).toEqual([]);
  });
  it("debounces search, resets page and replaces history; external URL changes update input", async () => {
    const change = vi.fn();
    const { result, rerender } = renderHook(
      ({ q }) => useMemberSearch({ q, page: 2, effectivePage: 2, change }),
      { initialProps: { q: "" } },
    );
    act(() => result.current.setInput("  Alice  "));
    expect(change).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(change).toHaveBeenCalledWith({ q: "Alice", page: 1 }, true),
    );
    rerender({ q: "back" });
    expect(result.current.input).toBe("back");
  });
  it.each(["Ali", "Alic"])(
    "preserves newer typing when the earlier search %s reaches the URL",
    (q) => {
      vi.useFakeTimers();
      try {
        const change = vi.fn();
        const { result, rerender } = renderHook(
          ({ q }) => useMemberSearch({ q, page: 1, effectivePage: 1, change }),
          { initialProps: { q: "" } },
        );
        act(() => result.current.setInput("Ali"));
        act(() => vi.advanceTimersByTime(300));
        expect(change).toHaveBeenLastCalledWith({ q: "Ali", page: 1 }, true);

        act(() => result.current.setInput("Alic"));
        act(() => vi.advanceTimersByTime(300));
        expect(change).toHaveBeenLastCalledWith({ q: "Alic", page: 1 }, true);

        act(() => result.current.setInput("Alice"));
        rerender({ q });
        expect(result.current.input).toBe("Alice");
        expect(result.current.changing).toBe(true);
        act(() => vi.advanceTimersByTime(300));
        expect(change).toHaveBeenLastCalledWith({ q: "Alice", page: 1 }, true);

        rerender({ q: "Alice" });
        expect(result.current.input).toBe("Alice");
        expect(result.current.changing).toBe(false);
        rerender({ q: "Ali" });
        expect(result.current.input).toBe("Ali");
      } finally {
        vi.useRealTimers();
      }
    },
  );
});

describe("controlled dialog focus", () => {
  it("restores a menu's trigger and falls back to search if the removed row disappears", async () => {
    const view = render(
      <main>
        <input aria-label="Search" />
        <button type="button" aria-controls="member-menu">
          Row actions
        </button>
        <div role="menu" id="member-menu">
          <button type="button" role="menuitem">
            Remove
          </button>
        </div>
      </main>,
    );
    const { result } = renderHook(() => useDialogFocus());
    screen.getByRole("menuitem").focus();
    act(() => result.current.rememberFocus());
    view.rerender(
      <main>
        <input aria-label="Search" />
        <button type="button" aria-controls="member-menu">
          Row actions
        </button>
      </main>,
    );
    act(() =>
      result.current.restoreFocus(new Event("close", { cancelable: true })),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Row actions" })).toHaveFocus(),
    );
    view.rerender(
      <main>
        <input aria-label="Search" />
      </main>,
    );
    act(() =>
      result.current.restoreFocus(new Event("close", { cancelable: true })),
    );
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus(),
    );
  });
});

describe("operation hooks", () => {
  it("retains labelled partial failures, awaits refresh, and retries only eligible failed IDs", async () => {
    const complete = vi.fn(),
      close = vi.fn();
    add
      .mockResolvedValueOnce({
        succeeded: ["self"],
        skipped: [],
        failed: [{ userId: "other", code: "LIMIT", message: "Full" }],
      })
      .mockResolvedValueOnce({ succeeded: ["other"], skipped: [], failed: [] });
    const { result } = renderHook(
      () =>
        useAddTeamMembers({
          scope: "org",
          eligibleRows: rows,
          onComplete: complete,
          onClose: close,
        }),
      { wrapper: Wrapper },
    );
    act(() => result.current.submit("team", rows));
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(invalidate).toHaveBeenCalledOnce();
    expect(result.current.failures).toEqual([
      {
        userId: "other",
        code: "LIMIT",
        message: "Full",
        label: "other@test.com",
      },
    ]);
    expect(close).not.toHaveBeenCalled();
    act(() => result.current.retry("team", rows));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(add.mock.calls[1][0].data.userIds).toEqual(["other"]);
    expect(complete).toHaveBeenCalledTimes(2);
  });
  it("does not retry assignment targets that disappeared from the visible page", async () => {
    const { result, rerender } = renderHook(
      ({ visible }) =>
        useAddTeamMembers({
          scope: "org",
          eligibleRows: visible,
          onComplete: vi.fn(),
        }),
      { wrapper: Wrapper, initialProps: { visible: rows } },
    );
    act(() => result.current.open(rows));
    act(() => result.current.form.setFieldValue("teamId", "team"));
    rerender({ visible: [] });
    expect(result.current.canSubmit).toBe(false);
    await act(() => result.current.form.handleSubmit());
    expect(add).not.toHaveBeenCalled();
  });
  it("freezes targets and prevents dismissal while pending, closing after successful refresh", async () => {
    let resolve!: (value: unknown) => void;
    add.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const { result } = renderHook(
      () =>
        useAddTeamMembers({
          scope: "org",
          eligibleRows: rows,
          onComplete: vi.fn(),
        }),
      { wrapper: Wrapper },
    );
    act(() => result.current.open(rows));
    act(() => result.current.submit("team", rows));
    await waitFor(() => expect(result.current.isPending).toBe(true));
    act(() => result.current.close());
    expect(result.current.targets).toHaveLength(2);
    act(() =>
      resolve({ succeeded: ["self", "other"], skipped: [], failed: [] }),
    );
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.targets).toEqual([]);
  });
  it("navigates away before invalidating after organization self-removal", async () => {
    removeOrg.mockResolvedValue({
      succeeded: ["self"],
      skipped: [],
      failed: [],
    });
    const { result } = renderHook(
      () =>
        useRemoveOrganizationMembers({
          organizationId: "org",
          userId: "self",
          scope: "org",
          onComplete: vi.fn(),
        }),
      { wrapper: Wrapper },
    );
    act(() => result.current.open([rows[0]]));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(navigate).toHaveBeenCalledWith({
      to: "/organizations",
      state: { memberManagementFailures: [] },
    });
    expect(navigate.mock.invocationCallOrder[0]).toBeLessThan(
      invalidate.mock.invocationCallOrder[0],
    );
  });
  it("navigates to the team overview after self-removal while preserving partial failures", async () => {
    removeTeam.mockResolvedValue({
      succeeded: ["self"],
      skipped: [],
      failed: [{ userId: "other", code: "DENIED", message: "Denied" }],
    });
    const { result } = renderHook(
      () =>
        useRemoveTeamMembers({
          teamId: "team",
          userId: "self",
          scope: "team",
          onComplete: vi.fn(),
        }),
      { wrapper: Wrapper },
    );
    act(() => result.current.open(rows));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(navigate).toHaveBeenCalledWith({
      to: "/teams/$teamId",
      params: { teamId: "team" },
      state: {
        memberManagementFailures: [
          {
            userId: "other",
            label: "other@test.com",
            code: "DENIED",
            message: "Denied",
          },
        ],
      },
    });
    expect(result.current.failures[0].label).toBe("other@test.com");
  });
  it("rejects role errors without treating them as success and allows own role changes", async () => {
    updateRole.mockRejectedValue(new Error("Last owner cannot be demoted"));
    const { result } = renderHook(() => useUpdateMemberRole("org", "org"), {
      wrapper: Wrapper,
    });
    act(() => result.current.open({ ...rows[0], role: "owner" }));
    await act(() => result.current.form.handleSubmit());
    expect(updateRole).not.toHaveBeenCalled();
    act(() => result.current.form.setFieldValue("role", "member"));
    await act(() => result.current.form.handleSubmit());
    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(result.current.error).toBe("Last owner cannot be demoted");
    expect(success).not.toHaveBeenCalled();
    expect(updateRole).toHaveBeenCalledWith({
      data: { organizationId: "org", memberId: "m-self", role: "member" },
    });
  });
  it("refreshes after a transport failure and never automatically retries", async () => {
    add.mockRejectedValue(new Error("Network interrupted"));
    const { result } = renderHook(
      () =>
        useAddTeamMembers({
          scope: "org",
          eligibleRows: rows,
          onComplete: vi.fn(),
        }),
      { wrapper: Wrapper },
    );
    act(() => result.current.submit("team", rows));
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(add).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
    expect(result.current.failures).toHaveLength(2);
  });
  it("resets picker state on close/reopen and clears selection on local search/page changes", async () => {
    const { result } = renderHook(
      () => useTeamMemberPicker("team", rows, "team/q/1"),
      { wrapper: Wrapper },
    );
    act(() => result.current.open());
    act(() => result.current.selection.toggleAll());
    expect(result.current.selection.ids).toHaveLength(2);
    act(() => result.current.setInput("other"));
    expect(result.current.selection.ids).toEqual([]);
    act(() => result.current.close());
    act(() => result.current.open());
    expect(result.current.input).toBe("");
    expect(result.current.members.page).toBe(1);
    expect(result.current.selection.ids).toEqual([]);
  });
});
