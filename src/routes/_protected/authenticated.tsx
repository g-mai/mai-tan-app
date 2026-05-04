import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient, user, session } = Route.useRouteContext();

  return (
    <div className="text-center flex flex-col gap-4">
      <div>Welcome, {user.name}!</div>
      <h1>User:</h1>
      <pre className="bg-muted rounded-xl p-2 text-left text-xs break-all whitespace-pre-wrap max-w-sm m-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
      <h1>Session:</h1>
      <pre className="bg-muted rounded-xl p-2 text-left text-xs break-all whitespace-pre-wrap max-w-sm m-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
