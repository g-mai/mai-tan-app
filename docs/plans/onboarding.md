# Registration & Onboarding

## Context

The current "Demo" experience signs a visitor in as an anonymous guest and bulk-seeds
2 orgs × 10 users × 3 teams. It shows the app but teaches nothing about the product,
and the real `/register` form (first/last name + email + password + confirm) drops the
user on an empty `/dashboard` with no orgs.

This replaces both with a single guided path: **email-only registration → mandatory email
confirmation → set password → 5-step onboarding → app**. The anonymous demo is removed
entirely; the faker generator survives as the "create a fake teammate" button in the
invite step.

Onboarding is **mandatory and resumable**: every route outside the flow redirects an
in-progress user back to their current step.

---

## Decisions

| Question | Decision |
|---|---|
| Existing anonymous demo | **Remove entirely** — `src/features/demo/`, the `anonymous` plugin, the `is_anonymous` column, and all `DemoButton` usages. Home hero/CTA point at `/register`. Keep the faker generator. |
| Email confirmation | **Mandatory** — no skip. |
| Account creation w/o password | **Email OTP plugin** — `signIn.emailOtp` auto-registers a user with no credential account. |
| Invitations (step 8) | **Full flow** — `sendInvitationEmail` via Resend, invite form, pending list w/ cancel + resend, and a working `/invite/$invitationId` acceptance route. |
| Abandoned-registration purge | **Script + documented cron** (see §10). |
| Account deletion | **Build now** — `user.deleteUser` enabled, danger zone in `/settings`. |
| `useCreateOrg` / `useCreateTeam` navigation | **Move to the caller** — hooks only call `onCreated(entity)`. Also un-breaks the currently unreachable `<EditOrg>` branch in `/organizations/new`. |
| Schema migration | **`pnpm db:auth-generate`**, the official Better Auth path. |

---

## The registration path

`signIn.emailOtp` creates the user **and** the session, with no credential account — so
`auth.api.setPassword` works cleanly afterwards (it throws only when a credential account
already exists).

```
/register (email)  ──→  /register/verify  ──→  /register/password  ──→  /onboarding/profile
sendVerificationOtp      signIn.emailOtp()      auth.api.setPassword()
 type: "sign-in"         user (verified,        onboardingStep: "profile"
                         no password) + session
```

From `/register/verify` onward the user always has a session, so the onboarding gate
resumes them at the right step.

**Abandoned registrations resume without special-casing.** If someone verifies and then
closes the tab before setting a password, re-entering the same email at `/register` sends
a fresh code; `signInEmailOTP` finds the existing user, skips creation, and issues a
session ([`routes.mjs:423-425`](../../node_modules/better-auth/dist/plugins/email-otp/routes.mjs)).
The gate lands them back on `/register/password`.

---

## Onboarding state

A single `onboardingStep` additional field on `user`, advanced with
`authClient.updateUser({ onboardingStep })`.

**Use `updateUser`, never a direct Drizzle write.** The session cookie cache is enabled
(`maxAge: 5 * 60`), so a raw DB write would leave `getSession()` serving a stale step for
up to 5 minutes and the gate would bounce the user backwards. `updateUser` calls
`setSessionCookie` with the updated user, refreshing the cache
(`api/routes/update-user.mjs:69`).

That requires `input: true`, so the step is client-settable — consistent with every
existing `additionalFields` entry in `auth.ts`. Each step's *effect* (password set, org
created, team created) is still enforced by the real Better Auth endpoints.

| `onboardingStep` | Route | Step |
|---|---|---|
| `"password"` | `/register/password` | 3 |
| `"profile"` | `/onboarding/profile` | 4 |
| `"organization"` | `/onboarding/organization` | 5 |
| `"subscription"` | `/onboarding/subscription` | 6 |
| `"team"` | `/onboarding/team` | 7 |
| `"invite"` | `/onboarding/invite` | 8 |
| `"complete"` | `/onboarding/complete` | 9 |
| `"done"` or `""` | — full app access | — |

`""` is the column default, so **every existing/seeded user is treated as done** and is
never dragged into the flow.

---

## Implementation

### 1. Auth config — `src/features/auth/lib/auth.ts`

- Add the `emailOTP` plugin: `emailOTP({ otpLength: 6, expiresIn: 60 * 10, sendVerificationOTP })`.
  `sendVerificationOTP` delegates to a new `sendVerificationOtpEmail` in `emails.ts`, and
  early-returns when `SKIP_VERIFICATION_EMAIL === "true"` (mirrors the existing
  `sendVerificationEmail` guard so seeding stays quiet).
  Do **not** set `overrideDefaultEmailVerification` — the existing link-based change-email
  and reset-password flows stay exactly as they are.
- Add `onboardingStep` to `user.additionalFields`: `{ type: "string", required: false, defaultValue: "" }`.
- Add `user.deleteUser: { enabled: true, beforeDelete }` — `beforeDelete` deletes any org
  where the user is the **only owner** (see §9).
- Add `organizationPlugin({ sendInvitationEmail })` (see §8).
- **Remove** the `anonymous()` plugin.
- Verify: `pnpm check` clean; `auth.api.sendVerificationOTP` / `signInEmailOTP` / `setPassword` / `deleteUser` all typed.

### 2. Auth client — `src/features/auth/lib/auth-client.ts`

- Add `emailOTPClient()`; remove `anonymousClient()`.
- Export `emailOtp` and `deleteUser` alongside the existing named exports.
- Verify: `signIn.emailOtp` and `emailOtp.sendVerificationOtp` are typed on the client.

### 3. Schema + migration

Driven by the config change in §1 — adding `onboardingStep` to `additionalFields` and
dropping the `anonymous` plugin is what produces the column diff.

- `pnpm db:auth-generate` → regenerates `src/lib/db/auth-schema.ts`.
- **Review the diff before `db:generate`.** Check specifically that the hand-written
  `relations()` blocks at the end of the file (`teamRelations`, `memberRelations`, …)
  survived. They drive Drizzle's relational queries, and `getFullTeam` / `listTeams` in
  `org.functions.ts` break at runtime — not at compile time — if they disappear. Re-add
  anything the generator drops.
- `pnpm db:generate` → the SQL should be exactly one `ADD COLUMN onboarding_step` and one
  `DROP COLUMN is_anonymous` → `pnpm db:migrate`.
- Verify: `pnpm db:studio` shows `onboarding_step`, no `is_anonymous`; then load a team
  detail page to confirm the relational queries still resolve.

### 4. OTP email — `src/features/auth/emails/verification-otp-email.tsx`

New React Email template in the style of the existing two: the 6-digit code rendered
large and monospaced, an expiry line, and "ignore this if you didn't request it".
`sendVerificationOtpEmail({ email, otp })` added to `src/lib/resend/emails.ts` following
the exact shape of `sendVerifyEmail` (try/catch, log, rethrow so Better Auth sees failures).

### 5. Registration routes — `src/routes/_auth/register/`

`_auth/register.tsx` becomes a directory (it has no `<Outlet/>`, so this is a pure move —
same pattern as `_protected/organizations/`).

**`index.tsx`** — step 1. Single email field via `useAppForm`. Below it, the disclaimer:
emails are only used for account and transactional messages, never marketing, and all
account data can be permanently deleted from `/settings` at any time. Submit calls
`emailOtp.sendVerificationOtp({ email, type: "sign-in" })` then navigates to
`/register/verify?email=…`. Keeps the existing "Already have an account? Log in" footer.
The `<DemoButton />` block is deleted.

**`verify.tsx`** — step 2. `validateSearch: z.object({ email: z.email() })`; redirect to
`/register` if absent. A 6-digit code field, a **Verify** button
(`signIn.emailOtp({ email, otp, onboardingStep: "password" })` — `signInEmailOTP` passes
configured additional fields through to `createUser`), and a **Resend code** link. Surface
the plugin's failure modes as field errors rather than generic toasts: wrong code, expired
code, and "too many attempts" (3 by default, after which the OTP is invalidated and a
resend is required).

**`password.tsx`** — step 3. Password + confirm password, `z.string().min(8)` with a
matching refinement. The session is always present here; if it isn't, redirect to
`/register`. Submit calls a `setInitialPassword` server fn (`auth.api.setPassword` is
server-only) which then sets `updateUser({ onboardingStep: "profile" })`.

`useRegister.ts` is rewritten as `useRegisterEmail` (step 1); new `useVerifyEmailOtp` and
`useSetInitialPassword` hooks sit beside it, following the existing `useMutation` + `useAppForm` shape.

- Verify: the OTP email arrives with a 6-digit code; a wrong code shows a field error and
  the third wrong attempt forces a resend; success lands on `/onboarding/profile` with
  `onboardingStep === "profile"` and `email_verified = true`.

### 6. The gate — `src/features/onboarding/lib/onboarding.ts`

Pure, unit-testable module:

```ts
export const ONBOARDING_STEPS = ["password","profile","organization",
  "subscription","team","invite","complete"] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]
export const ONBOARDING_ROUTES: Record<OnboardingStep, string>

/** null == onboarding finished (covers both "done" and the "" default). */
export function getOnboardingStep(user): OnboardingStep | null
export function ensureOnboardingComplete(ctx)          // throws redirect to the step
export function ensureOnboardingStep(ctx, step)        // throws redirect if URL ≠ stored step
```

Wiring:
- `_protected/route.tsx` — `ensureSession(ctx)` then `ensureOnboardingComplete(ctx)`.
- `onboarding/route.tsx` — `ensureSession(ctx)`; redirect to `/dashboard` when complete.
- Each onboarding child — `ensureOnboardingStep(ctx, "<its step>")`.
- `_auth/route.tsx` — if a session exists and onboarding is incomplete, redirect to the
  stored step, so `/login` and `/register` bounce back into the flow. No loop:
  `/register/password` *is* the target for step `"password"`.
- `routes/index.tsx` (public marketing home) — untouched.

- Verify: as an in-progress user, manually entering `/dashboard`, `/settings`,
  `/organizations`, `/login` and any out-of-order `/onboarding/*` URL all land on the
  current step. Reload keeps you there.

### 7. Onboarding layout + steps — `src/routes/onboarding/`

`route.tsx` — layout: `LogoTitle`, a step indicator (`Step N of 5`, driven by
`ONBOARDING_STEPS`), a centered `Card`, `Footer`. No sidebar, no org selector.

**`profile.tsx`** (step 4) — first name + last name (required), plus the existing
`<ImageUpload prefix="avatars" entityId={user.id} />` for the optional picture, uploading
immediately on pick exactly like `ProfileSection`. Continue →
`updateUser({ firstName, lastName, name: \`${firstName} ${lastName}\`, onboardingStep: "organization" })`.

**`organization.tsx`** (step 5) — reuses `<CreateOrg onCreated={…} />`. `onCreated` sets
`favouriteOrganization` and advances to `"subscription"`. `organization.create` already
makes the new org active.

**`subscription.tsx`** (step 6) — reuses `<ComingSoon>` with copy explaining that
subscriptions arrive once Stripe is integrated (per the roadmap: org-scoped, seat-based),
plus a Continue button → `"team"`.

**`team.tsx`** (step 7) — an explanation card first: creating an organization
automatically created a default team named after it (Better Auth's
`teams.defaultTeam.enabled`, on by default); teams scope people and work inside an org;
use them for departments, projects or clients. Then
`<CreateTeam organizations={[activeOrg]} />` for a second team. Continue → `"invite"`.

**`invite.tsx`** (step 8) — an explanation of invitations and roles, `<InviteMember>`
(see §8), `<PendingInvitations>`, and a **Create a fake teammate** button. Finish → `"complete"`.

**`complete.tsx`** (step 9) — "You're all set", a short what's-next list (create more
organizations, manage teams, invite people, `/settings` incl. permanent account deletion,
the `/docs` and `/stack` pages), and a **Go to the app** button that sets
`onboardingStep: "done"` and navigates to `/dashboard`.

### 8. Invitations — full flow

- **`auth.ts`** — `organizationPlugin({ sendInvitationEmail })` building
  `${BETTER_AUTH_URL}/invite/${data.id}` and sending via a new
  `src/features/organizations/emails/invitation-email.tsx` + `sendInvitationEmail` in `emails.ts`.
- **`src/features/organizations/hooks/`** — `useInviteMember`, `useCancelInvitation`,
  `useResendInvitation` (`organization.inviteMember` with `resend: true`),
  `useAcceptInvitation`.
- **`components/invite-member.tsx`** — email field + role `SelectField` (member / admin).
- **`components/pending-invitations.tsx`** — email, role, expiry, cancel and resend actions.
  Rendered both in the onboarding invite step and on the org detail page.
- **`src/routes/invite/$invitationId.tsx`** — public route:
  - signed in → `acceptInvitation`, then redirect to the org.
  - signed out → redirect to `/register?invitation=<id>` (with a "or log in" affordance
    preserving the id).
  - An invited *new* user still registers through steps 1–4, but after `acceptInvitation`
    their `onboardingStep` fast-forwards past `organization` to `subscription` — they
    already belong to an org and must not be pushed into creating a competing one.
- **`components/faker-member.tsx`** + `createFakeMember` server fn — moves
  `generateUser()` out of `src/features/demo/lib/faker-data.ts` to
  `src/features/organizations/lib/faker-member.ts`, trimmed to a single user. The server fn
  inserts the `user` row directly with Drizzle and then
  `auth.api.addMember({ body: { organizationId, userId, role: "member" } })`. The
  `addMember` call is what keeps the purge in §10 away from them.
  > Insert directly rather than via `auth.api.signUpEmail`: `bootstrapDemo` relied on
  > omitting `headers` to dodge session side effects, which was safe for a throwaway guest.
  > Here it would risk clobbering a real user's session cookie via `tanstackStartCookies`.
- Verify: invite a real address → email arrives → the link accepts into the org; cancel and
  resend work; the fake teammate appears in the member list with the current user still signed in.

### 9. Account deletion — `/settings`

- `auth.ts` → `user.deleteUser: { enabled: true, beforeDelete }`. `beforeDelete` finds
  every org where the user is the sole `owner` and deletes it (member/team/invitation rows
  cascade on `organization.id`). Without this, deleting a user cascades their `member` rows
  and leaves orphaned organizations.
- `src/features/auth/components/delete-account-section.tsx` — a destructive-variant card
  using the existing `AlertDialog`, requiring the password (Better Auth's `deleteUser`
  demands it for credential accounts), listing what will be deleted, then
  `deleteUser({ password })` → sign out → `/`.
- Rendered at the bottom of `/settings`, making the `/register` disclaimer truthful.

### 10. Abandoned-registration purge

Cleans up users who verified their email and then abandoned before setting a password.

- `src/lib/db/purge-abandoned.ts` — deletes users with **no `credential` account row**,
  **no `member` row**, and `createdAt < now - 48h`, reusing the sole-owner-org cleanup
  helper from `beforeDelete`. "No credential account" can only mean registration stopped at
  or before the password step, and is unreachable for anyone who finished.
- **The `member` condition is load-bearing, not belt-and-braces.** Fake teammates (§8) are
  inserted without a password and would otherwise match this query and vanish 48h after an
  onboarding session, silently breaking the org the user just built. Org membership is the
  signal that a passwordless user was deliberately created by someone else; an abandoned
  registration can never have it, because org creation is step 5, after the password. The
  same condition protects invite-created users. **Cover this with a test** — it's the one
  place in this plan where a wrong `WHERE` clause deletes real data.
- `package.json` → `"db:purge-abandoned": "tsx --env-file=.env src/lib/db/purge-abandoned.ts"`.
- Docs: how to wire it to a Netlify Scheduled Function or an external cron.
- Verify: abandon a registration at the password step, backdate `created_at`, run the
  script, confirm that user is gone and fully-registered users are untouched.

### 11. Removals

- Delete `src/features/demo/` (`demo-button.tsx`, `useDemo.ts`, `demo.functions.ts`), moving
  the generator per §8.
- `home-hero.tsx`, `home-cta.tsx` — replace `<DemoButton>` with a `<Link to="/register">`
  and rewrite the "no sign-up required" copy (it's no longer true).
- `auth.ts` / `auth-client.ts` — drop `anonymous` / `anonymousClient`.
- `auth-schema.ts` — drop `isAnonymous`.
- Run `pnpm knip` to catch anything orphaned by the removal.

### 12. Tests

- `useRegister.test.ts` — rewrite for the new email-only hook (it currently asserts
  `signUp.email` is called with five fields and navigates to `/dashboard`; both are gone).
- New: `onboarding.test.ts` for `getOnboardingStep` / `ONBOARDING_ROUTES`.
- New: `useVerifyEmailOtp.test.ts` — success plus the wrong-code and too-many-attempts
  paths, following the existing `vi.hoisted` + `renderHook` pattern.
- New: coverage for the `purge-abandoned` query per §10.
- `useLogin.test.ts` — unchanged.

### 13. Docs

- `docs/dev/tasks.md` — tick the Members & Invitations block and the Onboarding block.
- `docs/plans/demo.md` — mark superseded by this plan.
- `README` — replace the demo pitch with the registration flow.

---

## Files touched

| File | Change |
|---|---|
| `src/features/auth/lib/auth.ts` | `emailOTP` + `sendInvitationEmail` + `deleteUser` + `onboardingStep`; remove `anonymous` |
| `src/features/auth/lib/auth-client.ts` | `emailOTPClient`; remove `anonymousClient` |
| `src/lib/db/auth-schema.ts` (+ migration) | regenerated via `db:auth-generate`: `+ onboarding_step`, `- is_anonymous` |
| `src/lib/resend/emails.ts` | `sendVerificationOtpEmail`, `sendInvitationEmail` |
| `src/features/auth/emails/verification-otp-email.tsx` | **new** |
| `src/features/organizations/emails/invitation-email.tsx` | **new** |
| `src/routes/_auth/register/{index,verify,password}.tsx` | **new** (replaces `register.tsx`) |
| `src/features/auth/hooks/useRegister.ts` (+2 new hooks) | rewritten for the 3-part flow |
| `src/features/onboarding/lib/onboarding.ts` | **new** — step model + gate |
| `src/routes/onboarding/route.tsx` + 6 step routes | **new** |
| `src/routes/_protected/route.tsx`, `src/routes/_auth/route.tsx` | gate wiring |
| `src/features/organizations/hooks/useCreateOrg.ts`, `useCreateTeam.ts` | navigation moves to the caller |
| `src/routes/_protected/organizations/new.tsx`, `teams/new.tsx` | own their post-create navigation |
| `src/features/organizations/{hooks,components}/` invite* | **new** — invite, cancel, resend, pending list |
| `src/routes/invite/$invitationId.tsx` | **new** |
| `src/features/organizations/lib/faker-member.ts` + fake-member server fn | **new** (from `demo/lib/faker-data.ts`) |
| `src/features/auth/components/delete-account-section.tsx` | **new** |
| `src/routes/_protected/settings/index.tsx` | render the danger zone |
| `src/lib/db/purge-abandoned.ts`, `package.json` | **new** script |
| `src/features/demo/**`, `home-hero.tsx`, `home-cta.tsx` | demo removed |
| tests + docs | per §12, §13 |

---

## Verification (end-to-end)

1. `pnpm check` and `pnpm test` clean; `pnpm knip` reports no new orphans.
2. `pnpm db:migrate` applied; `onboarding_step` present, `is_anonymous` gone; a team detail
   page still loads (proves the `relations()` blocks survived regeneration).
3. **Happy path:** `/register` → email → code arrives → enter it → password → profile →
   org → subscription → team → invite → complete → `/dashboard`. `email_verified = true`.
4. **Bad codes:** a wrong code errors in place; the third wrong attempt invalidates the OTP
   and requires a resend; an expired code is rejected.
5. **Abandon and resume:** verify, then close the tab before setting a password. Re-enter
   the same email at `/register` → new code → back on `/register/password`, no duplicate user.
6. **Gate:** mid-onboarding, try `/dashboard`, `/settings`, `/organizations`, `/login`,
   and an out-of-order `/onboarding/*` URL — each redirects to the current step. Reload
   and re-login both resume at the same step.
7. **Existing users:** log in as a seeded user (`onboarding_step = ""`) — straight to
   `/dashboard`, never onboarded.
8. **Invites:** invite a real address, accept from the emailed link, cancel and resend a
   pending one. Create a fake teammate and confirm your own session survives.
9. **Deletion:** delete the account from `/settings`; the user, their memberships, and any
   solely-owned org are gone.
10. **Purge:** abandon a registration at the password step, backdate `created_at` past 48h,
    run `pnpm db:purge-abandoned`, confirm only that user is removed — specifically that
    the fake teammates from step 8, which are also passwordless, survive.
11. Home page has no demo button and every CTA reaches `/register`.

---

## Out of scope / follow-ups

- Stripe billing (step 6 is a deliberate placeholder — the only one this plan ships).
- Remove member / change member role on the org detail page — still open in `docs/dev/tasks.md`.
- Social sign-in; the OTP path would need a separate branch.
- Rate limiting beyond the emailOTP plugin's built-in defaults (3 send requests / 60s,
  3 verification attempts per code).
- Deploying the purge cron itself — documented, not wired.
- Passwordless login — `signIn.emailOtp` would work as a login method too, but `/login`
  stays password-only.
- `verification-email.tsx` dumps `<pre>{JSON.stringify(user)}</pre>` into the email body.
  Pre-existing, unrelated to this work.
