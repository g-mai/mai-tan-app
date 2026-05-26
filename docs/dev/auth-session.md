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
| `Organization`| The inferred organization type from Better Auth |

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
    const { session } = context; // typed Session | null
    // ...
  });
```

> **Note:** The redirect inside `authMiddleware` is currently commented out — it logs a warning but does not hard-redirect. For route-level protection, continue using `ensureSession` in `beforeLoad`.

---

## Session management UI

The user settings page (`src/routes/_protected/settings.tsx`) exposes a full session management panel.

**Loading sessions** — The route loader calls `getAllSessions` (server function, `auth.api.listSessions` under the hood) and returns the list. The component reads it via `Route.useLoaderData()`.

**`ActiveSessionsSection`** (`src/features/auth/components/active-sessions-section.tsx`) — Renders a card listing every active session. For each session it shows:
- Device icon (desktop / tablet / mobile) and browser name, parsed from `userAgent` using `ua-parser-js`
- OS / device model, IP address, and creation timestamp
- A **"Current Session"** badge on the session whose `id` matches `session.id` from router context

The current session gets a `SignOutButton`; all other sessions get a **Revoke Session** button that opens a confirmation `AlertDialog` before calling the `useRevokeSession` mutation.

**`useRevokeSession`** (`src/features/auth/hooks/useRevokeSession.ts`) — Wraps `revokeSession` from the auth client in a `useMutation`. On success it reloads the page (`window.location.reload()`) so the session list refreshes; on error it surfaces the message via a toast.

**`SignOutButton`** (`src/features/auth/components/sign-out-button.tsx`) — Standalone button that calls `signOut()` from the auth client, shows a loading spinner, then navigates to `/login`.
