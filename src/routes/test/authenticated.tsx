import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-functions";

export const Route = createFileRoute("/test/authenticated")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/demo/better-auth" });
    }

    return { user: session.user };
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
