import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ensureSession } from "#/lib/better-auth/auth-functions";

export const Route = createFileRoute("/_protected")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    return session;
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <div>
      <nav>{/* shared nav for auth'd routes */}</nav>
      <main>
        <Outlet /> {/* child routes render here */}
      </main>
    </div>
  );
}
