# Sprint: Feature Completeness

Tasks are grouped by area. Each item is scoped to a single, shippable unit of work.

**Status:** `[x]` done · `[ ]` to do

---

## File Uploads ⬆ priority

File upload infrastructure is shared across user avatars, organization logos, and team logos. The storage backend decision should be made first, then all three upload tasks can be implemented consistently.

> **Storage decision pending.** Three options to evaluate:
>
> - **AWS S3** — industry standard, mature SDKs, fits well in any cloud setup
> - **Cloudflare R2** — S3-compatible API, no egress fees, good choice if already on Cloudflare
> - **Uploadthing** — purpose-built for full-stack JS apps, minimal setup, handles resizing and delivery

- [ ] Decide on storage provider and set up the upload infrastructure (client-side upload component, server-side signed URL or direct upload handler)
- [ ] User avatar — upload, store, and display across the app (sidebar, settings, member lists)
- [ ] Organization logo — upload, store, and display on org cards and detail page
- [ ] Team logo — upload, store, and display on team cards and detail page

---

## Organizations

- [x] List all organizations the current user belongs to
- [x] View organization detail (name, description, metadata, member list, team list)
- [ ] Create organization — form (name, slug, description, website) + server function
- [ ] Edit organization details — form pre-filled with current values, updates via server function
- [ ] Delete organization — confirmation dialog, server function, redirect to org list after
- [ ] Organization logo — see **File Uploads** above

---

## Teams

- [ ] List teams — replace the current stub at `/teams` with a real view of all teams the user belongs to across all orgs
- [ ] Create team — form (name, description) scoped to an organization + server function
- [ ] View team detail — replace stub at `/teams/$teamId` with real content: team name, description, member list
- [ ] Edit team — form pre-filled with current values, updates via server function
- [ ] Delete team — confirmation dialog, server function, redirect to org detail after
- [ ] Add member to team — select from existing org members, assign to team
- [ ] Remove member from team — confirmation, server function
- [ ] Team logo — see **File Uploads** above

---

## Members & Invitations

- [ ] Configure `sendInvitationEmail` in `auth.ts` — construct the invite URL (`/invite/$invitationId`) and send it via Resend using the existing email infrastructure
- [ ] Invite member — modal on org detail page with email input and role selector (member / admin); calls Better Auth's `inviteMember` endpoint
- [ ] Invitation acceptance route — `/invite/$invitationId` page that:
  - If authenticated: calls `acceptInvitation` directly, then redirects to the org
  - If unauthenticated: redirects to login/register with the invitation ID preserved in the URL; after auth, resumes acceptance
- [ ] Pending invitations list — visible to org owners and admins on the org detail page; shows email, role, expiry
- [ ] Cancel invitation — action on pending invitation, with confirmation
- [ ] Resend invitation — regenerates and resends the invite email for a pending invitation
- [ ] Remove member from organization — action on member list, confirmation dialog, server function
- [ ] Change member role — inline role selector on member list (owner / admin / member), updates via server function

---

## User Profile & Settings

- [x] Change email (with verification)
- [x] Change password
- [x] Edit display name (first name, last name)
- [x] Session management — active sessions list with device/browser info, revoke individual sessions, sign out from current session
- [ ] Profile section polish — remove "Upload WIP" placeholder, display current email as a read-only field, clean up layout
- [ ] User avatar — see **File Uploads** above

---

## Onboarding & Empty States

- [ ] Post-signup redirect — after registration, check if the user belongs to any org; if not, redirect to the create organization page instead of the generic home page
- [ ] Empty state: no organizations — when a user has no orgs, show a clear prompt to create one instead of an empty list
- [ ] Empty state: no teams — when an org has no teams, show a prompt to create the first team
- [ ] Empty state: no members (besides self) — when an org has only the owner, show a prompt to invite teammates
- [ ] Empty state: no pending invitations — handled naturally by hiding the invitations section when the list is empty
