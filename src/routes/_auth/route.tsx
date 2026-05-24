import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import Footer from "#/features/layout/components/footer";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <h1 className="text-center">Title and logo</h1>
        <Card className="w-full max-w-md mx-auto mt-10 p-4">
          <Outlet /> {/* child routes render here */}
        </Card>
        <nav className="mt-4">
          <div className="flex justify-center items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: "nav-link is-active" }}
            >
              Home
            </Link>
            <Link
              to="/login"
              className="nav-link"
              activeProps={{ className: "nav-link is-active" }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="nav-link"
              activeProps={{ className: "nav-link is-active" }}
            >
              Register
            </Link>
            <Link
              to="/forgot-password"
              className="nav-link"
              activeProps={{ className: "nav-link is-active" }}
            >
              Forgot Password
            </Link>
          </div>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
