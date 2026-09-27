# Organization and team member management — engineering handover

## 1. Objective, confirmed decisions, and current state

### Objective

Create these authenticated pages:

- `/organizations/$orgId/members`
- `/teams/$teamId/members`

The pages must support searching members by name/email, changing organization roles, individual/bulk removal, and individual/bulk assignment of existing organization members to teams.

Replace the full member lists on organization/team overviews with small previews and links to the new pages.

### Confirmed product decisions

| Topic | Required behavior |
|---|---|
| Team roles | Keep organization roles only; introduce no independent team roles. |
| Overview lists | Show up to five members, the accurate total count, and a members-page link where Better Auth allows roster access; omit the team roster/count/link for callers outside the team. |
| Invitations | The Members/Invitations tab is the primary management page. The dashboard keeps personal incoming invitations visible to everyone and shows organization-sent invitations and quick resend/cancel controls only to owners/admins. |
| Organization layout | Members and Invitations tabs; Invitations is available only to owners/admins. |
| Viewing permissions | Follow Better Auth's endpoint defaults: organization members can read the organization roster and list all organization team summaries; reading a team's roster requires membership in that team, including for owners/admins. |
| Management permissions | Owners/admins manage memberships; only owners manage ownership. |
| Assignment entry points | Both the organization members page and the team members page. |
| Assignment targets | One target team per action; users can belong to multiple teams. |
| Search/pagination | Main lists are server-side, with 25 rows per page. The candidate dialog filters its bounded roster locally, also showing 25 rows per page. |
| Sort order | Alphabetical by name, with a stable ID tie-breaker. |
| Search behavior | Case-insensitive partial match against name OR email. |
| URL state | Search/page/tab on the main pages; local state inside the add-members dialog. |
| Bulk selection | Current page only; search/page changes clear selection. |
| Bulk failures | Preserve successes and report failures individually. |
| Role changes | Individual only, with confirmation. |
| Self-management | Allow the same self-actions as the relevant Better Auth endpoint. Admins/owners can change their own role or remove themselves where permitted; Better Auth protects the last owner. Keep existing self-service leave flows; add no new leave flow here. |
| Removal confirmation | Required for individual and bulk removal. |
| Membership limit | Keep the configured 100-member organization limit. |
| Mutation structure | Use operation-specific custom hooks following `useDeleteAccount`; hooks call `useMutation` directly and own mutation behavior. No generic mutation wrapper or mutations declared in components. |
| Responsibility split | Better Auth enforces its authorization and membership rules; server functions handle validated inputs, scoped reads, and batch processing; hooks handle mutation/UI orchestration; components render and forward events. |

### Existing implementation

Relevant existing code:

- `src/routes/_protected/organizations/$orgId/index.tsx` loads a full organization and renders its members, teams, and invitation controls.
- `src/routes/_protected/teams/$teamId/index.tsx` loads a full team and renders all team members.
- `src/features/organizations/components/member-list.tsx` renders organization members and is also used by onboarding.
- `src/features/organizations/components/team-members-card.tsx` renders team members.
- `src/features/organizations/components/org-manage-section.tsx` groups invitation controls and checks the caller’s role by searching the loaded member array.
- `src/features/organizations/lib/org.functions.ts` provides `getOrganization` and `listOrgMembers`; the latter discards Better Auth’s pagination total.
- `src/features/organizations/lib/team.functions.ts` provides `getFullTeam`, which loads all team members and their user records.
- `src/features/organizations/lib/org.ts` contains existing comma-separated role handling and `canManage`.
- `src/features/auth/hooks/useDeleteAccount.ts` is the reference for operation-specific hooks: it declares `useMutation`, converts client API errors into rejected mutations, handles invalidation/navigation/toasts, and exposes a small interface to the component.
- The dashboard renders the full organization member list and an invitations card with personal incoming invitations plus organization-sent invitations.

The new pages must not derive the caller’s permissions from the displayed member page. Search and pagination can exclude the caller.

### Backend capabilities already available

The installed Better Auth version provides:

- `auth.api.updateMemberRole`
- `auth.api.removeMember`
- `auth.api.addTeamMember`
- `auth.api.removeTeamMember`

Organization removal also removes the user’s memberships in that organization’s teams and updates team seat counts. Team removal preserves organization membership.

Team membership has no role column. Use the organization membership’s role for team rows.

The installed team mutation endpoints accept `organizationId`. Derive it from `teamId` on the server and pass it explicitly, because otherwise the endpoint uses the session’s active organization.

Better Auth's `listMembers` supports `limit`, `offset`, and membership-field filters, but it cannot search or sort joined user names/emails. Use it to load the bounded organization roster, then filter/sort/page on the server. `listOrganizationTeams` checks organization membership and lists all organization teams for any member; do not add a manager-only restriction. Use `listUserTeams` only when the UI specifically needs the caller's own teams. `listTeamMembers` requires both organization and team membership, including for owners/admins, and returns membership rows without user profiles or organization roles; combine it with the bounded organization roster. Do not add a privileged Drizzle path that bypasses this requirement. Use Better Auth for all membership writes. [List Teams](https://better-auth.com/docs/plugins/organization#list-teams) [List User Teams](https://better-auth.com/docs/plugins/organization#list-user-teams) [List Team Members](https://better-auth.com/docs/plugins/organization#list-team-members)

Use the installed Better Auth implementation as the source of truth for behavior; documentation may describe a different version. Its defaults already enforce caller authorization, target existence and organization association, valid roles, owner-only ownership changes, and last-owner protections. `addTeamMember` is idempotent for an existing team membership in the installed version. Do not recreate these checks or turn an already-assigned add into a custom error. [Update Member Role](https://better-auth.com/docs/plugins/organization#update-member-role) [Remove Member](https://better-auth.com/docs/plugins/organization#remove-member) [Add Team Member](https://better-auth.com/docs/plugins/organization#add-team-member)

### Boundaries

Do not add:

- Independent team roles or new permissions.
- Bulk role changes.
- New invitations directly from the team page.
- Multiple target teams in one assignment action.
- Persistent selection across pages or “select every search result.”
- Configurable sorting, page size, or additional member filters.
- New database columns, migrations, or a replacement auth system.
- New self-action prohibitions, role policies, or privileged roster access beyond Better Auth's defaults.
- Generic mutation factories/wrappers or inline `useMutation` calls in page/dialog components.
- A redesign of organization/team indexes, onboarding, or the dashboard; preserve their layouts while applying the visibility rules above to team data.

Update the dashboard member CTA and make its invitation card manager-aware. Managers link to the Invitations tab; other members link to Members. Preserve the dashboard member list and other dashboard/onboarding behavior.

## 2. Page behavior and user interactions

### Shared table

Build one feature-scoped table component used by both member pages and the team candidate picker.

Columns:

1. Selection checkbox, where management actions are available.
2. Person: avatar, name, and email beneath the name.
3. Organization role.
4. Row action menu, where actions are available.

Use email as the display-name fallback. Avatars require a fallback initial. Mark the caller with a small “You” indicator.

On narrow screens, keep name/email together and allow the table container to scroll horizontally if necessary. Do not allow the entire page to overflow.

Above the table:

- Search input labelled “Search members.”
- Matching-result count.
- Page-specific primary action.
- A contextual bulk toolbar when rows are selected.

Below the table:

- “Showing X–Y of Z members.”
- Previous/next pagination controls.
- Current page and total pages.

No interactive column sorting is required.

### Search and pagination

Use these defaults consistently:

- Query parameter: `q`, default `""`.
- Page parameter: `page`, default `1`.
- Fixed page size: `25`.
- Search input maximum length: `200`.
- Trim surrounding whitespace before querying.
- Debounce search navigation by `300ms`.
- Search changes reset the page to `1`.
- Search updates replace browser history; explicit pagination/tab navigation creates history entries.
- Browser back/forward updates the input and displayed table.
- Preserve search state on refresh through the URL.

Validate URL state with Zod. Invalid page values fall back to page `1`; invalid tab values fall back to Members. Server-function inputs must still be validated independently.

Server responses return the effective page after clamping to the available range. If it differs from the URL, replace the URL with that page.

For zero results, use page `1`, zero rows, and disabled pagination.

During transitions, show loading state and disable row selection/actions until the displayed rows correspond to the current query. Never allow an action against placeholder rows from the previous page.

Use TanStack Router's validated search parameters and route loaders for the main lists. The team route loader also supplies the authorized manager's bounded candidate roster; the dialog filters and paginates it using local state.

### Organization members page

Header:

- Title: “Members.”
- Organization name as subtitle.
- Link back to the organization overview.

Tabs:

- **Members**, visible to every organization member.
- **Invitations**, visible only to owners/admins.

Members tab:

- Searchable table.
- Individual “Change role,” “Remove from organization,” and “Add to team” actions.
- Bulk “Remove from organization” and “Add to team” actions.

Invitations tab:

- Reuse `InviteMember`.
- Reuse `PendingInvitations`.
- Preserve member/admin invitation roles, resend, cancel, expiration filtering, and existing email behavior.
- Load invitation data only for an authorized manager visiting this tab.
- A regular member opening `?tab=invitations` is redirected with URL replacement to Members; no invitation-management content is rendered.

Switching tabs clears selection and closes member-action dialogs. Reset Members pagination to page `1`; preserve `q` so returning to Members restores the search.

The existing pending-invitation display is reused as-is. Adding invitation search or pagination is outside this change.

### Role changes

Use a dialog containing:

- Target person’s name/email.
- Current role.
- A role selector.
- Cancel and “Change role” buttons.

Available roles:

- Owner caller: member, admin, owner.
- Admin caller: member or admin, for non-owner targets.
- Regular member: no role-change action.

Disable submission when the selected role is unchanged.

Include the caller when Better Auth permits the action. An admin can change their own role to member/admin; an owner can change their own role, but Better Auth rejects a last owner's demotion. Do not query owner counts to duplicate that protection. Do not support bulk role changes.

The selected value replaces the target's organization role with one of the three configured roles. Continue parsing existing role strings for UI action availability; never infer ownership with string equality alone. Better Auth remains authoritative for write permissions.

The confirmation must explicitly state that an organization role affects permissions throughout that organization, including its teams.

### Add selected organization members to a team

Individual and bulk assignment use the same target-team dialog.

The dialog:

- Displays selected people/count.
- Lists teams belonging to this organization, sorted by name.
- Requires one target team.
- Shows an “Add to team” button.

Do not use `getUserTeams` for target choices: an owner/admin must be able to choose any team in the organization.

If the organization has no teams, show “Create a team before adding members” and a link to the existing team-creation route. Do not create a new inline team flow.

Adding someone to an additional team does not remove existing team memberships.

Adding a person already in the chosen team uses Better Auth's idempotent behavior and counts as a successful ensured membership. Do not add a membership pre-check just to distinguish a new assignment from an existing one. Use success wording such as “Selected members are in the team.”

### Team members page

Header:

- Title: “Members.”
- Team name and organization name as context.
- Link back to the team overview.
- Link to the organization members page.

For owners/admins who belong to the team:

- “Add members” primary button.
- Individual “Remove from team.”
- Bulk “Remove from team.”

For ordinary organization members:

- This page is available only for teams they belong to, as it is for owners/admins.
- Search and pagination.
- Organization-role display.
- No selection or mutation controls.

A caller outside the team cannot read its roster through this page, regardless of their organization role. Owners/admins can still manage assignments to any organization team from the organization members page, using Better Auth's default write permissions. Team summary listings do not grant roster access.

Label the role column **Organization role**. Do not provide role editing on this page.

### Team add-members dialog

Use a dialog with:

- Title: “Add members to [team name].”
- Search input.
- Candidate table.
- Pagination.
- Selected count.
- Cancel and “Add members” buttons.

Candidates must:

- Belong to the team’s organization.
- Not already belong to the target team.
- Include the caller if otherwise eligible.

Use the same 25-row pagination and search semantics as the main lists.

Search, page, and selection are local to the dialog. Opening it starts with empty search, page `1`, and no selection. Closing clears its state.

The team route loader supplies the candidate roster once for managers. Keep dialog search and pagination local; do not add a separate query hook for this bounded list.

Selection is current-page only. Changing its search or page clears selection.

After a successful addition:

- Refresh team members and candidates.
- Close the dialog if there are no failures.
- Keep it open if failures occurred, with a persistent result summary and retry for failed targets.

### Selection and protected targets

Selection is keyed by `userId`; organization role changes separately use the organization membership ID.

Select-all applies only to eligible visible rows.

Organization selection must support assignment of people who cannot be removed, such as an owner viewed by an admin. Do not automatically exclude the caller. Therefore:

- Assignment considers every selected organization member.
- Removal derives the removable subset.
- Show the removal count separately from the overall selected count.
- Disable bulk removal when the removable subset is empty.
- In confirmation, explain how many selected people are excluded and why.
- The removal payload contains only the removable subset.

The removable subset is a UI affordance based on the caller/target roles, not server authorization. Do not calculate last-owner eligibility locally; let Better Auth return a failure if the action would remove the last owner.

For team removal, every visible team member is removable by an authorized manager, including the caller.

Clear selection when scope, search, page, or tab changes. After a mutation, remove successful/skipped IDs from selection; retain failed IDs only if still visible and eligible.

### Confirmation, loading, and errors

Removal confirmation must identify the scope and affected people/count.

Organization wording includes:

> Removing these members also removes them from this organization’s teams.

Team wording includes:

> These people will remain members of the organization.

Do not require a password or typed organization/team name.

Freeze the confirmed target IDs when submitting. Disable conflicting table controls and dialog dismissal while the mutation is pending.

Use:

- Skeletons for initial loading.
- A clear empty state for no team members.
- A separate “No members match your search” state.
- Retry controls for failed reads.
- Existing Sonner toasts for brief success/failure summaries.
- A persistent inline result panel for per-person bulk failures.

Use proper dialog titles, labelled controls, focus restoration, and an indeterminate select-all checkbox.

## 3. Server functions, contracts, and authorization

### File organization

Keep new functionality within `src/features/organizations`.

Recommended implementation modules:

- `lib/member-management.ts`: shared types, validation, and pure search/selection helpers; role predicates are UI affordances based on the existing default roles, not a replacement authorization system.
- `lib/member-management.functions.ts`: authenticated read and mutation server functions.
- Operation-specific hooks: `hooks/useUpdateOrganizationMemberRole.ts`, `hooks/useRemoveOrganizationMembers.ts`, `hooks/useAddTeamMembers.ts`, and `hooks/useRemoveTeamMembers.ts`, following `src/features/auth/hooks/useDeleteAccount.ts`.
- Feature components for the shared table, role/removal/assignment dialogs, and team candidate dialog.
- The two new `members.tsx` route files.

These are feature-specific modules, not a generic data-table framework.

Use `#/` imports. Import database tables from `#/lib/db/schema`. Keep Worker database/auth imports inside server boundaries.

Use TanStack Router loaders as the source of server-read data. Keep search/page state in route search for the main lists and dialog state local for the team candidate picker. Mutations use the existing React Query `useMutation` pattern and `router.invalidate()`; do not add a separate query-options/cache layer for these reads.

### Hook and component responsibilities

Each operation-specific hook declares `useMutation` directly. Follow `useDeleteAccount` for input/form handling, pending state, error presentation, success toasts, awaited `router.invalidate()`, and any navigation. Use `useAppForm` where a form is needed. Server functions already reject on failure; only convert a returned `{ error }` into a thrown error when using a Better Auth client method that returns that shape.

Keep mutation submission, frozen target IDs/labels, batch-result interpretation, failure/retry state, selection updates, and dialog completion in the feature hooks. Put nontrivial search/selection/dialog coordination in feature hooks as needed; pure helpers can remain in `lib/member-management.ts`. A hook can expose a focused callback for a caller-owned display state change without becoming a generic mutation factory.

Route components wire loader/search data to hooks and render the page. Table/dialog components receive display data, pending state, and event callbacks. They must not declare `useMutation`, call mutation server functions directly, invalidate routes, map bulk errors, emit mutation toasts, or catch/rethrow mutation errors. Avoid a component-level `mutateAsync`/`try`/`catch` layer that repeats the hook's behavior.

Use clear operation-specific exports rather than `useMemberManagementMutation`, a shared options factory, or a configurable mutation pipeline. A few repeated `onSuccess`/`onError` lines are acceptable. Keep auth/database operations and authoritative validation on the server; client hooks do not enforce security.

### Shared contracts

Use a projected row shape equivalent to:

```ts
type OrganizationRole = "owner" | "admin" | "member";

type MemberRow = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

type MemberPage = {
  rows: MemberRow[];
  total: number;
  page: number;
};
```

`memberId` identifies organization membership and is used for role changes. Use `userId` for selection and team-membership writes. Keep the page size as one shared constant; derive the page count from `total`.

Do not return full user records, session data, or unrelated auth fields.

Page context must contain:

- Organization ID/name/slug.
- Team ID/name where relevant.
- Caller user ID and current organization role.

Return `name`/`slug` at the top level of route loader data so the existing breadcrumb resolver can label dynamic URL segments without modification.

### Read functions

Implement these capabilities:

| Function | Input | Output |
|---|---|---|
| `getOrganizationMemberContext` | `organizationId` | Organization page context. |
| `getTeamMemberContext` | `teamId` | Team page context; derive its organization server-side. |
| `listOrganizationMembersPage` | `organizationId`, `q`, `page` | `MemberPage`. |
| `listTeamMembersPage` | `teamId`, `q`, `page` | `MemberPage`. |
| `listTeamCandidates` | `teamId` | Projected candidates for the local dialog search/pagination. |
| `listAssignableTeams` | `organizationId` | Sorted team IDs/names. |

Every team-specific read and mutation accepts `teamId` only, resolves the team and its organization server-side, then scopes all work to that organization. The browser never supplies the team’s organization association. Organization-scoped reads such as `listAssignableTeams` use the organization route context.

Apply `authMiddleware` to every new read and mutation function.

For reads:

1. Resolve authenticated caller.
2. Execute the relevant Better Auth read with explicit scope and request headers; rely on its organization/team membership checks.
3. Project, combine, filter, sort, and paginate the authorized data as needed.
4. For context or metadata that requires a direct database read, scope it to the organization and establish access before returning it. Do not repeat the same authorization lookup before a Better Auth call that already establishes it.
5. Keep manager-only workflow data, such as invitation management, behind the existing role/permission check only where the underlying read does not enforce that restriction. This is separate from membership-write authorization.

Obtain caller permissions independently of the displayed, searched page. Reuse authorized context instead of looking it up again in every helper. Do not add an owner-count query; Better Auth enforces its owner protections for writes.

### Query implementation

Organization members:

- Use `auth.api.listMembers` with the requested organization ID, `limit: 100`, and `offset: 0`. It returns the members and total and validates the caller’s membership.
- Filter name/email, sort, and slice the requested 25-row page on the server. The configured organization membership limit is 100, so this keeps search server-side without custom substring SQL or a separate count query.

Team members:

- Use Better Auth's `listTeamMembers` and `listMembers`; match the returned team user IDs against the bounded organization roster to get profile fields and organization roles.
- Let `listTeamMembers` reject callers outside the team, including owners/admins. Do not replace that failure with a privileged direct membership read.
- Derive the organization from `teamId`; return only projected fields in `MemberRow`.
- Filter, sort, and paginate the bounded result on the server.

Team lists:

- Use `auth.api.listOrganizationTeams` (client equivalent: `organization.listTeams`) when displaying all teams in an organization, for every organization role. Do not wrap it in a manager-only check.
- Preserve `listUserTeams` for views explicitly showing “My teams”; do not treat that filter as an authorization rule.
- Organization overviews and dashboard summaries can show the teams returned by `listOrganizationTeams`. Team overview roster previews and direct member-page URLs must use `listTeamMembers` and preserve its default access rule.

Team candidates:

- On the team members page, load the organization roster with `auth.api.listMembers` and exclude the users returned by the already-authorized `listTeamMembers` read. Reuse the result for the member page and candidate list.
- Return the projected candidate roster to the authorized manager’s route loader; the dialog searches and paginates this at-most-100-person list locally.

Share the case-insensitive substring matcher, display-name fallback, and alphabetical sort helper across the server-side member-page reads. String matching naturally treats `%`, `_`, quotes, and backslashes literally.

Order by normalized display name, then `userId`. Use email as the name fallback for empty names.

Count matching rows and clamp requested pages after filtering, before slicing. This intentionally scans at most 100 organization members; if the configured membership limit increases, revisit database-side filtering and pagination.

No search index or collation migration is part of this work.

### Mutations

Implement:

```ts
updateOrganizationMemberRole({
  organizationId,
  memberId,
  role,
});

removeOrganizationMembers({
  organizationId,
  userIds,
});

addTeamMembers({
  teamId,
  userIds,
});

removeTeamMembers({
  teamId,
  userIds,
});
```

Validate:

- IDs are non-empty strings.
- Role is one of the three configured roles.
- `userIds` is non-empty and contains at most 25 entries.
- Deduplicate IDs while preserving input order.

Individual add/remove actions call the same batch endpoints with one user ID.

Return batch outcomes equivalent to:

```ts
type BatchResult = {
  succeeded: string[];
  skipped: Array<{ userId: string; reason: string }>;
  failed: Array<{
    userId: string;
    code: string;
    message: string;
  }>;
};
```

Only return target IDs already submitted by the caller. The UI retains submitted name/email labels for presenting outcomes.

### Permission matrix

| Action | Member | Admin | Owner |
|---|---:|---:|---:|
| Read organization member list | Yes | Yes | Yes |
| Read own team details and members | Yes | Yes | Yes |
| List all organization team summaries | Yes | Yes | Yes |
| Read a team roster without belonging to the team | No | No | No |
| Invite/resend/cancel | No | Yes | Yes |
| Add/remove team members | No | Yes | Yes |
| Remove other non-owner org members | No | Yes | Yes |
| Change other non-owner member/admin roles | No | Yes | Yes |
| Promote another member to owner | No | No | Yes |
| Change/remove another owner | No | No | Yes, with owner protection |
| Remove self through `removeMember` | No | Yes | Yes, unless last owner |
| Change own organization role | No | Yes, to member/admin | Yes, unless demoting the last owner |

This matrix describes Better Auth's current default endpoints, not new application authorization code. The separate `leaveOrganization` endpoint allows ordinary members to leave; preserve any existing self-service flow without adding one to this feature. Do not add self-action bans or change the plugin's permission configuration.

### Mutation processing

Perform batch operations sequentially.

Server functions add only validated input contracts, team-to-organization resolution, user-ID-to-member-ID mapping where required, and sequential batch outcome collection. Do not add `requireManagerForWrite`, owner/target pre-checks, or a second authorization implementation around Better Auth's membership-write endpoints.

For a role change, validate the input and call `auth.api.updateMemberRole` with request headers and the explicit organization ID. Do not query caller/target memberships first or wrap the call in a message-string error allowlist. Better Auth already validates permissions, the target's existence and organization, role validity, owner-only changes, and last-owner safety.

For each batch target, call the relevant Better Auth API with request headers and the explicit organization ID, then record the outcome. Organization removal needs a scoped mapping from submitted `userId` to organization membership ID because `removeMember` accepts a member ID/email; obtain that mapping from an authorized organization roster. This lookup is an input translation, not a second permission check. A user absent from that mapping can be reported as skipped without searching other organizations for them. Do not add per-target membership reads for team writes; Better Auth handles membership changes between loading and submitting.

Better Auth checks the caller's current membership and permission on each write. Stop the batch on an identifiable caller authorization/session failure and report the remaining targets as failed without further writes. Use structured error codes/status, not message matching or broad regular expressions; a capacity error can also have status 403 and must not be misclassified as permission loss. Do not classify an ambiguous `MEMBER_NOT_FOUND` as a target skip when it could describe the caller.

Never directly delete organization/team memberships or directly update roles. Better Auth must preserve hooks, cleanup, seat counts, and its session behavior.

Rely on Better Auth's last-owner protections for both self-actions and changes to other owners. Do not add an owner-count query, distributed lock, or custom transaction system; bulk writes retain the existing per-operation guarantees.

Existing membership states:

- Add to team when already assigned: successful ensured membership, following Better Auth's idempotent endpoint.
- Remove from team when already absent, while still an org member: translate the specific endpoint outcome into a skip; do not pre-check it.
- Remove from organization when absent from the authorized mapping: skipped. Do not query global memberships to distinguish a foreign user from a former member.
- A foreign member ID submitted to role changes is rejected by Better Auth. Team writes use the resolved organization and let Better Auth reject foreign targets, without exposing their details.
- Target no longer in the organization during team addition: failure.
- Permission loss during a batch: mark remaining targets failed without further writes.

Catch errors on the server only where needed to produce a batch result or keep unexpected internal details out of the response. Use Better Auth's structured codes and safe API messages for known per-target failures; unexpected infrastructure failures return a generic message. Preserve useful error identity across the server-function boundary so the operation hook can present it. Do not use nested catches, duplicated “known message” arrays, or error wrappers that merely rename the same failure. Hooks own UI error presentation; server functions must not emit toasts.

There is no batch rollback. Do not automatically retry mutations after a transport error: refresh first and let the user retry unresolved targets.

## 4. Routing, caching, overview changes, and implementation sequence

### Routes and loaders

Add:

- `src/routes/_protected/organizations/$orgId/members.tsx`
- `src/routes/_protected/teams/$teamId/members.tsx`

Inherit session/onboarding protection from `_protected`.

Each route:

1. Validates search parameters.
2. Loads fresh authorized page context.
3. Declares `loaderDeps` for relevant list parameters; the organization route also depends on `tab` so invitation data loads only when requested by a manager.
4. Loads the current member page through its authenticated server function.
5. Returns top-level name/slug for breadcrumbs.
6. Uses the existing route-error presentation with an appropriate member-page title.

The organization route loader loads the member page and assignable teams only on the Members tab, and invitation data only when a manager opens the Invitations tab. The team route loader includes candidate rows only for managers. Existing invitation mutation hooks call `router.invalidate`, so the relocated controls continue refreshing.

Allow the route generator to update `src/routeTree.gen.ts`; never edit it manually.

### Loader refresh

Route loaders own server reads. `q` and `page` are loader dependencies for the main member lists; changing them reruns the scoped server read. Candidate search/page state stays local over the manager-only roster supplied by the team route loader.

Each operation-specific hook handles every completed membership mutation, including partial success:

- Await `router.invalidate()` to reload the active route's context and list data when the caller still has access.
- Handle self-removal or self-demotion by navigating to an accessible route when the current page/tab is no longer available; avoid invalidating an inaccessible page first.
- Correct the URL if the last page disappeared, using the effective loader page and hook-owned search coordination.
- Update selection, completion/dialog state, and the result summary in hooks.

Do not use optimistic role/removal updates or a second explicit list refresh. Confirmed server outcomes and the route loader determine the UI.

### Overview previews

Introduce bounded overview read helpers rather than changing existing full-data helpers used elsewhere.

Organization overview response:

- Existing organization display fields.
- Actual organization member count.
- At most five projected member rows in the standard sort order.
- Team IDs/names and total count returned by `listOrganizationTeams`, available to every organization member under Better Auth's default rules.
- Caller role fetched independently.
- No invitations; invitation management lives on the Members page.

Team overview response:

- Existing team display fields and organization name.
- Team metadata within the authorized organization scope. Include the actual member count and at most five projected rows only when the caller belongs to the team, using `listTeamMembers`; otherwise omit the roster/count and its members-page link.
- Caller’s organization role.

Update overview cards to receive explicit counts rather than calculating totals from preview array lengths.

Extend the current preview components with explicit count/link props as needed. Preserve `MemberList`’s existing onboarding defaults.

Remove `OrgManageSection` from the organization overview. Delete its component only if it has no remaining consumers.

Keep existing full organization helpers for edit routes and onboarding. Existing full-team reads must not bypass `listTeamMembers`' default authorization when returning a roster; separate authorized team metadata from the roster where needed. Replace the dashboard's use of `getOrganization` with a safe dashboard read: return the existing full member list (still bounded by the 100-member limit), organization metadata, the caller's management status, and organization team summaries from Better Auth. Do not return organization invitations to regular members. Load organization-sent invitations only for owners/admins. Personal incoming invitations remain visible to everyone.

Make the dashboard invitation card manager-aware: show personal incoming invitations to everyone; show the organization-sent invitation section and resend/cancel controls only to owners/admins. Label the section “Organization invitations,” not “Sent by you.” The dashboard's pending-invitation count is also manager-only. The manager CTA links to:

```text
/organizations/$orgId/members?tab=invitations
```

For regular members, show a “View members” link to `/organizations/$orgId/members`. Do not truncate or otherwise redesign the dashboard member list as part of this implementation.

### UI dependencies

Reuse existing:

- Avatar.
- Button.
- Card.
- Input.
- Select.
- DropdownMenu.
- Dialog.
- AlertDialog.
- Skeleton.
- Sonner.

Add only missing official shadcn/Radix components needed for:

- Table.
- Checkbox.
- Pagination.
- Tabs.
- Alert/Empty feedback components if used.

Match the existing New York style and `#/` aliases. Do not replace installed primitives or introduce `@tanstack/react-table`.

The planning-time CLI documentation lookup failed because registry access was unavailable. During implementation, retry the documented shadcn CLI workflow; do not silently switch primitive libraries. [shadcn Radix Table](https://ui.shadcn.com/docs/components/radix/table)

### Implementation order

1. **Baseline:** record current checks and inspect existing component usages.
2. **Contracts/defaults:** implement shared types, Zod validation, UI role predicates, and selection rules using Better Auth's default behavior.
3. **Read backend:** implement bounded roster reads, server-side filtering/page slicing, contexts, and candidates.
4. **Write backend:** implement a thin validated role-change call and sequential batch results using Better Auth; do not duplicate its authorization or edge-case checks.
5. **Operation hooks:** follow `useDeleteAccount` for each mutation, including errors, invalidation/navigation, toasts, batch results, retry/selection state, and dialog completion. No generic mutation wrapper.
6. **Shared UI and routes:** render the table, confirmations, assignment dialogs, and result states from hook interfaces; connect Router loaders and URL state without inline mutation logic.
7. **Existing pages:** switch overviews to bounded previews and update dashboard invitation visibility and links.
8. **Verification:** complete automated and manual acceptance checks.

Keep each stage focused on this feature. Do not repair unrelated formatting, stale documentation, or existing aliases unless they block the change; report blockers separately.

## 5. Verification, acceptance criteria, and delivery

### Automated tests

Use Vitest and the existing React Testing Library setup. Mock Worker/auth boundaries to verify server-function delegation and batch processing; test the bounded filter/sort/page helper directly. Mocked Better Auth errors establish that the application preserves the outcome, not that Better Auth enforces its own rules. Verify the important default authorization and ownership behaviors with real Better Auth in integration tests or the manual Worker/D1 checks below; do not build a duplicate authorization implementation just to satisfy mocked tests.

#### Read/search tests

- Name substring matches.
- Email substring matches.
- Name OR email matches in one search.
- Case differences and surrounding whitespace.
- Literal `%`, `_`, quotes, and backslashes.
- Empty search returns the scoped list.
- Multiple people with identical names retain stable ordering.
- A 26-member dataset returns 25 rows on page one and one on page two.
- Matching total reflects the search, independently of the organization’s overall count.
- Invalid page input is handled by URL validation.
- Out-of-range page clamps to the last valid page.
- Zero matches produce page one with zero results.
- Candidate list excludes existing team members.
- Team rows show the organization role.
- Returned rows contain only projected identity fields.
- Caller role remains correct when the caller is not on the displayed page.

#### Authorization tests

- Anonymous caller rejected.
- Non-member rejected from all scoped reads.
- Regular org member can read their own team's list and is denied another team's list and direct URL.
- Admin/owner can read a team's roster only when they belong to it; no direct query bypasses Better Auth for other teams.
- Every organization role can use `listOrganizationTeams`; team summary visibility does not imply roster access.
- Regular member cannot read assignment candidates or mutate.
- Admin can manage non-owner memberships.
- Admin cannot promote to owner or edit/remove an owner.
- Owner can promote another person to owner.
- Admin self-removal and self-role changes are forwarded to Better Auth rather than blocked locally.
- Owner self-removal/demotion succeeds when Better Auth permits it and another owner remains.
- Authorized self-add/self-removal from a team succeeds.
- Sole-owner removal/demotion rejected.
- Team IDs are resolved to their organization on the server; a caller cannot pair a team with another organization.
- Foreign member IDs/targets are rejected by Better Auth; mapping queries never search outside the requested organization.
- Mutation calls carry explicit organization IDs while another org is active.
- Role changes delegate directly to `updateMemberRole` without caller/target queries or a message-string error allowlist.

#### Bulk tests

- One selected user uses the same endpoint as a bulk action.
- Input IDs are deduplicated.
- Empty or oversized input rejected.
- Calls are sequential.
- One target failure does not undo earlier successes.
- Adding an existing team member preserves Better Auth's idempotent success; there is no membership pre-check or duplicate-specific error.
- A target absent from the authorized organization mapping produces a skip; a stale mapping's ambiguous API error remains a failure. An absent team membership's specific endpoint error produces a skip.
- Better Auth permission checks run for each target write.
- Lost caller permission stops remaining writes.
- Capacity failures are not misclassified as permission loss just because they use status 403.
- Ambiguous missing-member errors are not silently converted to target skips.
- Result contains successes, skips, and useful failures.
- Retry submits only unresolved eligible targets.
- Direct membership/role database writes are not used.

#### Component/hook tests

- Read-only users see no mutation controls.
- Search resets pagination and selection.
- Page/tab changes clear selection.
- Select-all affects visible eligible rows only.
- Indeterminate checkbox state.
- Organization removal excludes owner targets for an admin and shows the correct removable count; it does not blanket-exclude the caller.
- Cancelling confirmation performs no mutation.
- Unchanged role cannot be submitted.
- Pending mutation disables conflicting controls.
- Partial failure leaves a persistent result panel.
- Successful rows leave selection.
- Each operation hook awaits Router invalidation after success/partial success while access remains.
- Self-removal or self-demotion navigates to an accessible view when necessary.
- Operation hooks own error toasts, bulk failure labels, retry payloads, selection updates, and dialog completion; page/dialog components only render and forward callbacks.
- A Better Auth client `{ error }` rejects the mutation; a rejecting server function is not wrapped in redundant error checks.
- Team picker state resets when closed/reopened.
- Regular members cannot render Invitations from a manually entered URL.
- Dashboard members see their personal incoming invitations and the Members link, but no organization-sent rows, controls, or invitation count.
- Dashboard owners/admins see organization-sent invitations and the Invitations link.

### Manual Worker/D1 verification

Use the existing local development environment and separate test users for owner, admin, and member.

Fixture requirements:

- Two organizations.
- At least 26 members in one organization.
- Two owners in that organization.
- Multiple teams, including an empty team.
- One user assigned to multiple teams.
- A pending invitation.
- A caller whose active organization differs from the page being managed.

Verify:

1. Search/pagination, refresh, and browser back/forward.
2. Individual role changes and ownership restrictions.
3. Single and bulk organization removal.
4. Organization removal clears that person’s team memberships and updates team counts.
5. Team removal preserves organization membership and memberships in other teams.
6. Assignment from both entry points.
7. Existing team assignments succeed idempotently; already-removed targets follow the documented skip/error rules.
8. Empty-team and no-candidate states.
9. Invitations remain functional after relocation; personal incoming invites remain visible to members while organization-sent invites and controls are manager-only on the dashboard.
10. Organization members can list all organization team summaries. Team roster reads require team membership for every role, including owners/admins. Managers outside a team can still assign people to it from the organization members page.
11. Five-row previews and accurate counts after changes.
12. Onboarding and edit pages remain functional.
13. Keyboard operation and focus restoration.
14. Light/dark layouts at 320px, 390px, 768px, and desktop widths.
15. No page-wide horizontal overflow.
16. Admin self-role changes/removal and owner self-demotion/removal with another owner follow Better Auth's defaults; the last owner's removal/demotion is rejected. Hooks handle any resulting loss of access/navigation.

### Required checks

Run:

```bash
pnpm test
pnpm typecheck
pnpm check
pnpm build
```

Do not run automatic repository-wide formatting.

If a required check fails before implementation, record that baseline and show whether the feature introduces additional failures. Build verification must also confirm server database/auth imports do not enter the client bundle.

No deployment, remote migration, or production data mutation is required to complete this handover.

### Definition of done

The implementation is complete when:

- Both routes work through direct navigation and overview links.
- All confirmed member search, role, removal, and assignment behaviors work.
- Permissions are enforced server-side, independently of visible UI.
- Better Auth owns its default membership-write authorization and edge cases; there are no duplicated manager/owner/target checks, self-action prohibitions, or privileged team-roster bypasses.
- Every mutation uses an operation-specific hook following `useDeleteAccount`; route/dialog components contain no mutation declarations or mutation orchestration, and there is no generic mutation wrapper.
- The current-page selection rule is consistent in main lists and dialogs.
- Partial outcomes are understandable and retryable.
- Overview counts are accurate and previews contain at most five members wherever Better Auth permits roster access; team previews/counts/links are omitted for callers outside the team.
- Organization invitations are managed from the new Invitations tab.
- The dashboard invitation link reaches that tab.
- Dashboard invitation rows, controls, count, and CTA are manager-aware.
- Existing onboarding and edit pages retain their behavior; the dashboard preserves its member list and incoming invitations while gating organization-sent invitations to managers.
- The schema and current membership limit remain unchanged.
- Automated/manual acceptance checks pass, with any unrelated baseline failures documented.
- The final implementation handover lists changed behavior, verification evidence, and remaining limitations without claiming unperformed checks.
