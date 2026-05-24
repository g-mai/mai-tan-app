# Session & Authentication

> All session utilities live in `src/features/auth/lib/auth.functions.ts`.

## Overview

| Function        | Type            | Purpose                                              |
| --------------- | --------------- | ---------------------------------------------------- |
| `getSession`    | Server function | Fetches the current session from Better Auth         |
| `ensureSession` | Utility         | Guards a route — redirects to `/login` if no session |

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
