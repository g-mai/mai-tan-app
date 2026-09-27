import {
  createFileRoute,
  Link,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback } from "react";
import { PageTitle } from "#/components/shared/page-title";
import { RouteError } from "#/components/shared/route-error";
import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { AssignMembersDialog } from "#/features/organizations/components/assign-members-dialog";
import { ChangeMemberRoleDialog } from "#/features/organizations/components/change-member-role-dialog";
import { InviteMember } from "#/features/organizations/components/invite-member";
import {
  MemberPagination,
  MemberSearch,
  MembersPending,
} from "#/features/organizations/components/member-list-controls";
import { MemberResults } from "#/features/organizations/components/member-results";
import { MemberTable } from "#/features/organizations/components/member-table";
import { PendingInvitations } from "#/features/organizations/components/pending-invitations";
import { RemoveMembersDialog } from "#/features/organizations/components/remove-members-dialog";
import { useAddTeamMembers } from "#/features/organizations/hooks/useAddTeamMembers";
import {
  useMemberSearch,
  useMemberSelection,
} from "#/features/organizations/hooks/useMemberSelection";
import { useRemoveOrganizationMembers } from "#/features/organizations/hooks/useRemoveOrganizationMembers";
import { useUpdateMemberRole } from "#/features/organizations/hooks/useUpdateMemberRole";
import { listOrgInvitations } from "#/features/organizations/lib/invitation.functions";
import {
  canManageMember,
  organizationMemberSearchSchema,
} from "#/features/organizations/lib/member-management";
import {
  getOrganizationMemberContext,
  listAssignableTeams,
  listOrganizationMembersPage,
} from "#/features/organizations/lib/member-management.functions";
import { canManage } from "#/features/organizations/lib/org";

export const Route = createFileRoute(
  "/_protected/organizations/$orgId/members",
)({
  validateSearch: organizationMemberSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const org = await getOrganizationMemberContext({
      data: { organizationId: params.orgId },
    });
    const isManager = canManage(org.role);
    if (deps.tab === "invitations") {
      if (!isManager)
        throw redirect({
          to: "/organizations/$orgId/members",
          params,
          search: { ...deps, tab: "members", page: 1 },
          replace: true,
        });
      return {
        ...org,
        isManager,
        members: { rows: [], total: 0, page: 1 },
        teams: [],
        invitations: await listOrgInvitations({
          data: { organizationId: org.id },
        }),
      };
    }
    const [members, teams] = await Promise.all([
      listOrganizationMembersPage({
        data: { organizationId: org.id, q: deps.q, page: deps.page },
      }),
      isManager
        ? listAssignableTeams({ data: { organizationId: org.id } })
        : [],
    ]);
    return { ...org, isManager, members, teams, invitations: [] };
  },
  pendingComponent: MembersPending,
  errorComponent: ({ error }) => (
    <RouteError
      title="Members unavailable"
      message="Could not load organization members."
      error={error}
      retry
    />
  ),
  component: RouteComponent,
});

function RouteComponent() {
  const org = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const loading = useRouterState({ select: (state) => state.isLoading });
  const scope = `${org.id}/${search.q}/${search.page}/${search.tab}/${org.role}`;
  const selection = useMemberSelection(scope, org.members.rows);
  const role = useUpdateMemberRole(org.id, scope);
  const removal = useRemoveOrganizationMembers({
    organizationId: org.id,
    userId: org.userId,
    scope,
    onComplete: selection.complete,
  });
  const assignment = useAddTeamMembers({
    scope,
    eligibleRows: org.members.rows,
    onComplete: selection.complete,
  });
  const changeSearch = useCallback(
    (values: { q: string; page: number }, replace: boolean) => {
      navigate({ search: (current) => ({ ...current, ...values }), replace });
    },
    [navigate],
  );
  const query = useMemberSearch({
    ...search,
    effectivePage:
      search.tab === "members" && !loading ? org.members.page : search.page,
    change: changeSearch,
  });
  const pending = role.isPending || removal.isPending || assignment.isPending;
  const disabled = pending || loading || query.changing;
  const removable = selection.selected.filter((row) =>
    canManageMember(org.role, row.role),
  );
  const retryable = org.members.rows.filter((row) =>
    canManageMember(org.role, row.role),
  );
  return (
    <div className="min-w-0 space-y-6">
      <PageTitle title="Members" subtitle={org.name} />
      <Button asChild variant="outline" size="sm">
        <Link to="/organizations/$orgId" params={{ orgId: org.id }}>
          Back to organization
        </Link>
      </Button>
      <Tabs
        value={search.tab}
        onValueChange={(tab) =>
          navigate({
            search: (current) => ({
              ...current,
              page: 1,
              tab: tab as "members" | "invitations",
            }),
          })
        }
      >
        <TabsList>
          <TabsTrigger value="members" disabled={pending || loading}>
            Members
          </TabsTrigger>
          {org.isManager && (
            <TabsTrigger value="invitations" disabled={pending || loading}>
              Invitations
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <MemberSearch
              value={query.input}
              onChange={query.setInput}
              disabled={pending}
              total={org.members.total}
            />
            {org.isManager && (
              <Button
                disabled={disabled}
                onClick={() =>
                  navigate({
                    search: { ...search, tab: "invitations", page: 1 },
                  })
                }
              >
                Invite member
              </Button>
            )}
          </div>
          {selection.ids.length > 0 && org.isManager && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm">
                {selection.ids.length} selected · {removable.length} removable
              </p>
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => assignment.open(selection.selected)}
              >
                Add to team
              </Button>
              <Button
                variant="destructive"
                disabled={disabled || !removable.length}
                onClick={() =>
                  removal.open(
                    removable,
                    selection.selected.length - removable.length,
                  )
                }
              >
                Remove from organization ({removable.length})
              </Button>
            </div>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground" role="status">
              Loading members…
            </p>
          )}
          <MemberTable
            rows={org.members.rows}
            userId={org.userId}
            disabled={disabled}
            selection={org.isManager ? selection : undefined}
            callerRole={org.role}
            onRole={org.isManager ? role.open : undefined}
            onRemove={org.isManager ? (row) => removal.open([row]) : undefined}
            onAssign={
              org.isManager ? (row) => assignment.open([row]) : undefined
            }
            emptyMessage={
              search.q
                ? "No members match your search."
                : "This organization has no members."
            }
          />
          <MemberPagination
            members={org.members}
            disabled={disabled}
            onPage={(page) => changeSearch({ q: search.q, page }, false)}
          />
          <MemberResults
            failures={removal.failures}
            disabled={disabled}
            canRetry={retryable.some((row) =>
              removal.failures.some((failure) => failure.userId === row.userId),
            )}
            onRetry={() => removal.retry(retryable)}
          />
        </TabsContent>
        {org.isManager && (
          <TabsContent value="invitations">
            <div className="grid gap-6 md:grid-cols-2">
              <InviteMember organizationId={org.id} />
              <PendingInvitations
                invitations={org.invitations}
                organizationId={org.id}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
      <ChangeMemberRoleDialog action={role} callerRole={org.role} />
      <AssignMembersDialog action={assignment} teams={org.teams} />
      <RemoveMembersDialog
        targets={removal.targets}
        scopeName={org.name}
        organization
        excluded={removal.excluded}
        isPending={removal.isPending}
        onClose={removal.close}
        onSubmit={removal.submit}
        restoreFocus={removal.restoreFocus}
      />
    </div>
  );
}
