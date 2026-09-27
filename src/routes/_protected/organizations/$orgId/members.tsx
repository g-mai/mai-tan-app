import {
  createFileRoute,
  Link,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { ArrowLeft, Mail, UserMinus, UserPlus, Users } from "lucide-react";
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
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2.5 self-start"
        >
          <Link to="/organizations/$orgId" params={{ orgId: org.id }}>
            <ArrowLeft data-icon="inline-start" />
            Back to organization
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Organization members
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {org.name} ·{" "}
              {org.isManager
                ? "Manage members, roles, and team assignments."
                : "View the people in your organization."}
            </p>
          </div>
          {org.isManager && search.tab === "members" && (
            <Button
              className="self-start sm:self-auto"
              disabled={disabled}
              onClick={() =>
                navigate({ search: { ...search, tab: "invitations", page: 1 } })
              }
            >
              <UserPlus data-icon="inline-start" />
              Invite member
            </Button>
          )}
        </div>
      </div>
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
        <div className="flex flex-col gap-1">
          <TabsList variant="line">
            <TabsTrigger value="members" disabled={pending || loading}>
              <Users />
              Members
            </TabsTrigger>
            {org.isManager && (
              <TabsTrigger value="invitations" disabled={pending || loading}>
                <Mail />
                Invitations
              </TabsTrigger>
            )}
          </TabsList>
          <Separator />
        </div>
        <TabsContent value="members" className="pt-4">
          <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle>Organization members</CardTitle>
                <CardDescription>
                  Roles control permissions across this organization and its
                  teams.
                </CardDescription>
              </div>
              <MemberSearch
                value={query.input}
                onChange={query.setInput}
                disabled={pending}
                total={org.members.total}
              />
            </CardHeader>
            <Separator />
            {selection.ids.length > 0 && org.isManager && (
              <div className="flex flex-wrap items-center gap-3 bg-muted/50 px-5 py-3">
                <p className="mr-auto text-sm font-medium tabular-nums">
                  {selection.ids.length} selected
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {removable.length} removable
                  </span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => assignment.open(selection.selected)}
                >
                  <Users data-icon="inline-start" />
                  Add to team
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={disabled || !removable.length}
                  onClick={() =>
                    removal.open(
                      removable,
                      selection.selected.length - removable.length,
                    )
                  }
                >
                  <UserMinus data-icon="inline-start" />
                  Remove members ({removable.length})
                </Button>
              </div>
            )}
            {loading && (
              <p
                className="px-5 py-2 text-sm text-muted-foreground"
                role="status"
              >
                Loading members…
              </p>
            )}
            <CardContent className="px-0">
              <MemberTable
                rows={org.members.rows}
                userId={org.userId}
                disabled={disabled}
                selection={org.isManager ? selection : undefined}
                callerRole={org.role}
                onRole={org.isManager ? role.open : undefined}
                onRemove={
                  org.isManager ? (row) => removal.open([row]) : undefined
                }
                onAssign={
                  org.isManager ? (row) => assignment.open([row]) : undefined
                }
                emptyMessage={
                  search.q
                    ? "No members match your search."
                    : "This organization has no members."
                }
              />
            </CardContent>
            <Separator />
            <CardFooter className="px-5 py-4">
              <MemberPagination
                members={org.members}
                disabled={disabled}
                onPage={(page) => changeSearch({ q: search.q, page }, false)}
              />
            </CardFooter>
          </Card>
          <div className="mt-4">
            <MemberResults
              failures={removal.failures}
              disabled={disabled}
              canRetry={retryable.some((row) =>
                removal.failures.some(
                  (failure) => failure.userId === row.userId,
                ),
              )}
              onRetry={() => removal.retry(retryable)}
            />
          </div>
        </TabsContent>
        {org.isManager && (
          <TabsContent value="invitations" className="pt-4">
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
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
