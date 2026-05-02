import { createFileRoute } from "@tanstack/react-router";
import { ensureSession } from "#/lib/better-auth/auth-functions";

export const Route = createFileRoute("/test/authenticated")({
  beforeLoad: (ctx) => {
    const { user } = ensureSession(ctx);
    return { user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <div>
      <div>Welcome, {user.name}!</div>
      <pre className="bg-muted rounded-xl p-2 text-left text-xs break-all whitespace-pre-wrap max-w-sm m-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
