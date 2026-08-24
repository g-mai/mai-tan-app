# Session & Authentication

> All session utilities live in `src/features/auth/lib/auth.functions.ts`.

## Overview

| Function/Hook          | Type            | Purpose                                              |
| ---------------------- | --------------- | ---------------------------------------------------- |
| `getSession`           | Server function | Fetches the current session from Better Auth         |
| `ensureSession`        | Utility         | Guards a route — redirects to `/login` if no session |
| `getAllSessions`        | Server function | Returns all active sessions for the current user     |
| `useRevokeSession`     | TanStack Query mutation | Revokes a session by token via the auth client |
| `authMiddleware`       | TanStack Start middleware | Injects `session` into server function context |
| `setInitialPassword`   | Server function | Sets the first password for an email-OTP account |
| `useDeleteAccount`     | TanStack Query mutation | Permanently deletes the account and its sole-owned orgs |

> Registration and the onboarding gate that follows it have their own guide —
> see [onboarding.md](./onboarding.md).

---

## Session types

Inferred types from Better Auth live in `src/features/auth/types.ts`. Import from there rather than from Better Auth directly.

```ts
import type { Session, User, SessionData } from "#/features/auth/types";
```

| Type          | What it represents                              |
| ------------- | ----------------------------------------------- |
| `Session`     | The full session object (`user` + `session`)    |
| `User`        | The `user` slice of a session                   |
| `SessionData` | The `session` slice (token, expiry, device info)|
| `Organization`| One entry of `orgs` — see below                 |

### What `customSession` adds

`auth.ts` wraps the instance in Better Auth's `customSession` plugin, so every session carries two
things a stock session does not:

- **`orgs`** — every organization the user belongs to, oldest membership first. This is why
  `OrganizationSelector` needs no separate fetch.
- **A guaranteed-valid `session.activeOrganizationId`** — `pickActiveOrganizationId`
  (`src/features/organizations/lib/org.ts`) re-picks it whenever the stored one is missing or
  points at an organization the user is no longer a member of, and writes the correction back to
  the `session` row. A `databaseHooks.session.create.before` hook seeds it at sign-in.

> The session cookie cache is enabled with `maxAge: 5 * 60`. Anything that changes user or session
> state has to go through the Better Auth API (`updateUser`, `organization.*`) rather than a direct
> DB write, otherwise the cached cookie serves stale data for up to five minutes.

---

## How the session reaches every route

`getSession` is called inside `beforeLoad` on the root route (`src/routes/__root.tsx`), so the session is available in the TanStack Router context for every route in the app — whether the user is logged in or not (`null` when unauthenticated).

---

## Protecting a route

Use `ensureSession` in a route's `beforeLoad` to require authentication. It reads `session` from the router context and throws a redirect to `/login` if it is missing, otherwise it returns the typed session object.

```ts
import { createFileRoute } from "@tanstack/react-router";
import { ensureSession } from "#/features/auth/lib/auth.functions";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    return { user: session.user };
  },
  component: RouteComponent,
});
```

---

## Reading the session in a component

Because the session is in the root route context, any component rendered inside the router tree can access it — no prop drilling required.

```ts
import { Route as RootRoute } from "#/routes/__root";

function UserBadge() {
  const { session } = RootRoute.useRouteContext();
  return <span>{session?.user.name ?? "Guest"}</span>;
}
```

> If you only need `session` and want to avoid re-renders on unrelated context changes, use the `select` option:
>
> ```ts
> const session = RootRoute.useRouteContext({ select: (ctx) => ctx.session });
> ```

---

## Protecting server functions with `authMiddleware`

`src/features/auth/middleware.ts` exports `authMiddleware`, a TanStack Start server middleware that fetches the session and injects it into the server function context. Use it on server functions that should only run for authenticated users.

```ts
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/features/auth/middleware";

const myProtectedFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { session } = context; // typed Session — never null here
    // ...
  });
```

> **Note:** `authMiddleware` throws `Unauthorized` when there is no session, so `context.session` is
> non-null inside the handler. It cannot redirect — it runs on the server function, not the route —
> so continue using `ensureSession` in `beforeLoad` for route-level protection.

---

## Session management UI

The user settings page (`src/routes/_protected/settings/index.tsx`) exposes a full session management panel.

**Loading sessions** — The route loader calls `getAllSessions` (server function, `auth.api.listSessions` under the hood) and returns the list. The component reads it via `Route.useLoaderData()`.

**`ActiveSessionsSection`** (`src/features/auth/components/active-sessions-section.tsx`) — Renders a card listing every active session. For each session it shows:
- Device icon (desktop / tablet / mobile) and browser name, parsed from `userAgent` using `ua-parser-js`
- OS / device model, IP address, and creation timestamp
- A **"Current Session"** badge on the session whose `id` matches `session.id` from router context

The current session gets a `SignOutButton`; all other sessions get a **Revoke Session** button that opens a confirmation `AlertDialog` before calling the `useRevokeSession` mutation.

**`useRevokeSession`** (`src/features/auth/hooks/useRevokeSession.ts`) — Wraps `revokeSession` from the auth client in a `useMutation`. On success it reloads the page (`window.location.reload()`) so the session list refreshes; on error it surfaces the message via a toast.

**`SignOutButton`** (`src/features/auth/components/sign-out-button.tsx`) — Standalone button that calls `signOut()` from the auth client, shows a loading spinner, then navigates to `/login`.

---

## Deleting an account

`user.deleteUser` is enabled in `auth.ts`, and the settings page exposes it through
`DeleteAccountSection` (`src/features/auth/components/delete-account-section.tsx`).

**Confirmation** — `useDeleteAccount` requires the current password and calls `deleteUser` from the
auth client. `INVALID_PASSWORD` gets a friendly message; every other error message is passed
through untouched, because failures raised inside `beforeDelete` are the actionable ones.

**Orphaned organizations** — an organization whose only owner is leaving would become unreachable,
so the `beforeDelete` hook deletes it outright. `findSoleOwnedOrgs`
(`src/features/organizations/lib/org.ts`) decides which ones qualify; teams, members and
invitations cascade on `organization.id`.

**Warning the user first** — the settings loader calls `listSoleOwnedOrgs`, and the confirmation
dialog names each organization that will be destroyed along with how many other members lose
access. Same rule, evaluated twice: once to warn, once to enforce.

**After deletion** — the endpoint has already dropped the sessions and cleared the cookie, so the
hook just invalidates the router and navigates to `/`. There is nothing left to sign out of.
