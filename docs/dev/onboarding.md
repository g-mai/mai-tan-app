# Registration & Onboarding

> The gate lives in `src/features/onboarding/lib/onboarding.ts`; every step transition goes
> through `useOnboardingNavigation` in `src/features/onboarding/hooks/useOnboardingNavigation.ts`.

## Overview

Registration is **email-first**: the account exists the moment a 6-digit code is verified, before
a password is ever set. Everything after that — password, profile, organization — is onboarding,
and it is **mandatory and resumable**: a user who closes the tab lands back on the same step next
time they sign in.

```
/register  →  /register/verify  →  /register/password  →  /onboarding/*  →  /dashboard
  email          6-digit OTP         sets credential       profile → org →
                 (creates user       account               plan → team →
                  + session)                               invite → done
```

---

## The step field

`user.onboardingStep` is a Better Auth additional field (`src/features/auth/lib/auth.ts`),
declared `type: "string"` with `defaultValue: ""`. The seven recognized values are
`ONBOARDING_STEPS`:

| Step           | Route                     | What it collects                             |
| -------------- | ------------------------- | -------------------------------------------- |
| `password`     | `/register/password`      | The credential account                       |
| `profile`      | `/onboarding/profile`     | First name, last name, avatar                |
| `organization` | `/onboarding/organization`| Create an org, or accept a pending invitation |
| `subscription` | `/onboarding/subscription`| Placeholder until Stripe lands               |
| `team`         | `/onboarding/team`        | An extra team (optional)                     |
| `invite`       | `/onboarding/invite`      | Invitations and fake teammates               |
| `complete`     | `/onboarding/complete`    | Nothing — the "you're all set" screen        |

`ONBOARDING_ROUTES` maps each step to its route. Keep the two in sync when adding a step; the
progress bar (`OnboardingProgress`) derives its length from `ONBOARDING_STEPS` directly.

**`null` means finished.** `getOnboardingStep` returns `null` for `"done"`, for the `""` column
default every pre-existing user carries, and for any unrecognized value. The field is
client-settable, so the gate deliberately **fails open** rather than stranding someone on a step
that doesn't exist.

---

## The three gates

| Guard                     | Used in                        | Behaviour                                                     |
| ------------------------- | ------------------------------ | ------------------------------------------------------------- |
| `ensureOnboardingComplete`| `_protected/route.tsx`, `_auth/route.tsx` | Onboarding in progress → redirect to the current step |
| `ensureOnboardingStep`    | Each `/onboarding/*` route     | Wrong step → redirect to the right one; finished → `/dashboard` |
| `getOnboardingStep`       | `onboarding/route.tsx`, `invite/$invitationId.tsx` | Raw read, for branching rather than redirecting |

`_auth/route.tsx` is the subtle one: a signed-in user normally gets bounced to `/dashboard`, but
`/register/password` is itself an onboarding target, so it checks `getOnboardingStep` **before**
redirecting and defers to `ensureOnboardingComplete` when a step is pending.

---

## Moving between steps

Always through `useOnboardingNavigation`, never a direct DB write:

```ts
const { navigate, isPending } = useOnboardingNavigation();

navigate({ onboardingStep: "team" });                       // forward
navigate({ onboardingStep: "profile", firstName, lastName }); // forward + fields
navigate({ onboardingStep: "done" });                        // finish → /dashboard
```

The hook calls `updateUser` from the auth client, then `router.invalidate()` before navigating.
That order is load-bearing: the session cookie cache (`maxAge: 5 * 60` in `auth.ts`) would
otherwise serve a stale step for up to five minutes and the gate would bounce the user backwards.

Going **back** is the same write — `OnboardingBackButton` just passes an earlier step.

---

## Invitations short-circuit the flow

Someone who arrives through an invitation doesn't own an organization, so the org/plan/team/invite
steps aren't theirs to complete. Both entry points jump them straight to `complete`:

- **`/onboarding/organization`** — if `session.orgs.length > 0`, or once `useAcceptInvitation`
  resolves, `navigate({ onboardingStep: "complete" })`.
- **`/invite/$invitationId`** — if the user still owes a password or a name (`password` /
  `profile`), they finish that first; any later step is set to `complete`; a finished user goes
  to `/dashboard`.

`/register?invitation=<id>` prefills the email from `getInvitationPreview`, but the param is
**cosmetic only** — the invitation is picked up from the user's pending invitations at the
organization step, so losing it costs a prefilled field and nothing more.

---

## Abandoned registrations

Stopping at `/register/password` leaves a real user row with a verified email, no credential
account, and no way to sign in again. A scheduled purge deletes those after 48 hours — see
[maintenance.md](./maintenance.md).

---

## Tests

| File | Covers |
| ---- | ------ |
| `src/features/onboarding/lib/onboarding.test.ts` | Step parsing and all three gates |
| `src/features/onboarding/hooks/useOnboardingNavigation.test.ts` | Invalidate-then-navigate ordering |
| `src/features/auth/hooks/useRegisterEmail.test.ts` | Sending the OTP |
| `src/features/auth/hooks/useVerifyEmailOtp.test.ts` | Error mapping, resend, dead-code detection |
| `src/features/auth/hooks/useSetInitialPassword.test.ts` | Password + step advance |
