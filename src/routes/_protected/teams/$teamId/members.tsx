import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useCallback } from "react";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Button } from "#/components/ui/button";
import {
  MemberPagination,
  MemberSearch,
  MembersPending,
} from "#/features/organizations/components/member-list-controls";
import { MemberResults } from "#/features/organizations/components/member-results";
import { MemberTable } from "#/features/organizations/components/member-table";
import { RemoveMembersDialog } from "#/features/organizations/components/remove-members-dialog";
import { TeamMemberPickerDialog } from "#/features/organizations/components/team-member-picker-dialog";
import {
  useMemberSearch,
  useMemberSelection,
} from "#/features/organizations/hooks/useMemberSelection";
import { useRemoveTeamMembers } from "#/features/organizations/hooks/useRemoveTeamMembers";
import { useTeamMemberPicker } from "#/features/organizations/hooks/useTeamMemberPicker";
import { memberSearchSchema } from "#/features/organizations/lib/member-management";
import { getTeamMembersPage } from "#/features/organizations/lib/member-management.functions";
import { canManage } from "#/features/organizations/lib/org";

export const Route = createFileRoute("/_protected/teams/$teamId/members")({
  validateSearch: memberSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) =>
    getTeamMembersPage({ data: { teamId: params.teamId, ...deps } }),
  pendingComponent: MembersPending,
  errorComponent: ({ error }) => (
    <RouteError
      title="Members unavailable"
      message="Could not load team members."
      error={error}
      retry
    />
  ),
  component: RouteComponent,
});

function RouteComponent() {
  const team = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const loading = useRouterState({ select: (state) => state.isLoading });
  const scope = `${team.teamId}/${search.q}/${search.page}/${team.role}`;
  const selection = useMemberSelection(scope, team.members.rows);
  const removal = useRemoveTeamMembers({
    teamId: team.teamId,
    userId: team.userId,
    scope,
    onComplete: selection.complete,
  });
  const picker = useTeamMemberPicker(team.teamId, team.candidates, scope);
  const isManager = canManage(team.role);
  const changeSearch = useCallback(
    (values: { q: string; page: number }, replace: boolean) => {
      navigate({ search: values, replace });
    },
    [navigate],
  );
  const query = useMemberSearch({
    ...search,
    effectivePage: loading ? search.page : team.members.page,
    change: changeSearch,
  });
  const pending = removal.isPending || picker.action.isPending;
  const disabled = pending || loading || query.changing;
  return (
    <div className="min-w-0 space-y-6">
      <PageTitle
        title="Members"
        subtitle={`${team.name} · ${team.organizationName}`}
      />
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/teams/$teamId" params={{ teamId: team.teamId }}>
            Back to team
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link
            to="/organizations/$orgId/members"
            params={{ orgId: team.organizationId }}
            search={{ q: "", page: 1, tab: "members" }}
          >
            Organization members
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <MemberSearch
          value={query.input}
          onChange={query.setInput}
          disabled={pending}
          total={team.members.total}
        />
        {isManager && (
          <Button disabled={disabled} onClick={picker.open}>
            Add members
          </Button>
        )}
      </div>
      {isManager && selection.ids.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm">{selection.ids.length} selected</p>
          <Button
            variant="destructive"
            disabled={disabled}
            onClick={() => removal.open(selection.selected)}
          >
            Remove from team
          </Button>
        </div>
      )}
      {loading && (
        <p className="text-sm text-muted-foreground" role="status">
          Loading members…
        </p>
      )}
      <MemberTable
        rows={team.members.rows}
        userId={team.userId}
        disabled={disabled}
        selection={isManager ? selection : undefined}
        onRemove={isManager ? (row) => removal.open([row]) : undefined}
        emptyMessage={
          search.q
            ? "No members match your search."
            : "This team has no members yet."
        }
      />
      <MemberPagination
        members={team.members}
        disabled={disabled}
        onPage={(page) => changeSearch({ q: search.q, page }, false)}
      />
      <MemberResults
        failures={removal.failures}
        disabled={disabled}
        canRetry={team.members.rows.some((row) =>
          removal.failures.some((failure) => failure.userId === row.userId),
        )}
        onRetry={() => removal.retry(team.members.rows)}
      />
      <RemoveMembersDialog
        targets={removal.targets}
        scopeName={team.name}
        isPending={removal.isPending}
        onClose={removal.close}
        onSubmit={removal.submit}
        restoreFocus={removal.restoreFocus}
      />
      <TeamMemberPickerDialog
        picker={picker}
        name={team.name}
        userId={team.userId}
      />
    </div>
  );
}
