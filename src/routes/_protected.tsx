import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ensureSession } from "#/lib/better-auth/auth-functions";
import Header from "#/components/Header";
import Footer from "#/components/Footer";

export const Route = createFileRoute("/_protected")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    return session;
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-8 max-w-5xl m-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
