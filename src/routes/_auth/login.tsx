import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>Login page</h1>
      <Link to="/test/authenticated">Test if authenticated</Link>
    </div>
  );
}
