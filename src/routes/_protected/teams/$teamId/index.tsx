import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Edit, UserMinus, UserPlus } from "lucide-react";
import { useCallback } from "react";
import { RouteError } from "#/components/shared/route-error";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import {
  MemberPagination,
  MemberSearch,
  MembersPending,
} from "#/features/organizations/components/member-list-controls";
import { MemberResults } from "#/features/organizations/components/member-results";
import { MemberTable } from "#/features/organizations/components/member-table";
import { RemoveMembersDialog } from "#/features/organizations/components/remove-members-dialog";
import { TeamLogo } from "#/features/organizations/components/team-logo";
import { TeamMemberPickerDialog } from "#/features/organizations/components/team-member-picker-dialog";
import {
  useMemberSearch,
  useMemberSelection,
} from "#/features/organizations/hooks/useMemberSelection";
import { useRemoveTeamMembers } from "#/features/organizations/hooks/useRemoveTeamMembers";
import { useTeamMemberPicker } from "#/features/organizations/hooks/useTeamMemberPicker";
import { memberSearchSchema } from "#/features/organizations/lib/member-management";
import { getTeamOverview } from "#/features/organizations/lib/member-management.functions";
import { canManage } from "#/features/organizations/lib/org";

export const Route = createFileRoute("/_protected/teams/$teamId/")({
  validateSearch: memberSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) =>
    getTeamOverview({ data: { teamId: params.teamId, ...deps } }),
  pendingComponent: MembersPending,
  errorComponent: ({ error }) => (
    <RouteError
      title="Team unavailable"
      message="Could not load this team."
      error={error}
      retry
    />
  ),
  component: RouteComponent,
});

function RouteComponent() {
  const team = Route.useLoaderData();
  const members = team.members ?? { rows: [], total: 0, page: 1 };
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const loading = useRouterState({ select: (state) => state.isLoading });
  const scope = `${team.id}/${search.q}/${search.page}/${team.role}`;
  const selection = useMemberSelection(scope, members.rows);
  const removal = useRemoveTeamMembers({
    teamId: team.id,
    userId: team.userId,
    scope,
    onComplete: selection.complete,
  });
  const picker = useTeamMemberPicker(team.id, team.candidates, scope);
  const isManager = canManage(team.role);
  const changeSearch = useCallback(
    (values: { q: string; page: number }, replace: boolean) => {
      navigate({ search: values, replace });
    },
    [navigate],
  );
  const query = useMemberSearch({
    ...search,
    effectivePage: loading ? search.page : members.page,
    change: changeSearch,
  });
  const pending = removal.isPending || picker.action.isPending;
  const disabled = pending || loading || query.changing;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2.5 self-start"
        >
          <Link
            to="/organizations/$orgId"
            params={{ orgId: team.organizationId }}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to organization
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <TeamLogo
              logoUrl={team.logo}
              name={team.name}
              color={team.color}
              size={64}
              className="shrink-0"
            />
            <div className="min-w-0">
              <h1 className="wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl">
                {team.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <Link
                  to="/organizations/$orgId"
                  params={{ orgId: team.organizationId }}
                  className="wrap-break-word hover:underline"
                >
                  {team.organization.name}
                </Link>
              </p>
              {team.description && (
                <p className="mt-3 max-w-3xl wrap-break-word text-sm leading-relaxed text-muted-foreground">
                  {team.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isManager && (
              <Button asChild variant="outline" size="sm">
                <Link to="/teams/$teamId/edit" params={{ teamId: team.id }}>
                  <Edit data-icon="inline-start" />
                  Edit team
                </Link>
              </Button>
            )}
            {isManager && (
              <Button disabled={disabled} onClick={picker.open}>
                <UserPlus data-icon="inline-start" />
                Add members
              </Button>
            )}
          </div>
        </div>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage the members of this team.</CardDescription>
          </div>
          <MemberSearch
            value={query.input}
            onChange={query.setInput}
            disabled={pending}
            total={members.total}
          />
        </CardHeader>
        <Separator />
        {isManager && selection.ids.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-muted/50 px-5 py-3">
            <p className="mr-auto text-sm font-medium tabular-nums">
              {selection.ids.length} selected
            </p>
            <Button
              variant="destructive"
              size="sm"
              disabled={disabled}
              onClick={() => removal.open(selection.selected)}
            >
              <UserMinus data-icon="inline-start" />
              Remove from team
            </Button>
          </div>
        )}
        {loading && (
          <p className="px-5 py-2 text-sm text-muted-foreground" role="status">
            Loading members…
          </p>
        )}
        <CardContent className="px-0">
          <MemberTable
            rows={members.rows}
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
        </CardContent>
        <Separator />
        <CardFooter className="px-5 py-4">
          <MemberPagination
            members={members}
            disabled={disabled}
            onPage={(page) => changeSearch({ q: search.q, page }, false)}
          />
        </CardFooter>
      </Card>
      <MemberResults
        failures={removal.failures}
        disabled={disabled}
        canRetry={members.rows.some((row) =>
          removal.failures.some((failure) => failure.userId === row.userId),
        )}
        onRetry={() => removal.retry(members.rows)}
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
