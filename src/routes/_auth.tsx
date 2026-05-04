import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  // Optional: protect all child routes
  // beforeLoad: ({ context }) => {
  // if (!context.session) {
  //   throw redirect({ to: "/login" });
  // }
  // },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div>
      <nav>{/* shared nav for auth'd routes */}</nav>
      <main>
        <Outlet /> {/* child routes render here */}
      </main>
    </div>
  );
}
