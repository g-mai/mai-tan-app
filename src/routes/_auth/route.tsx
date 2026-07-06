import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import Footer from "#/features/layout/components/footer";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center">
        <LogoTitle href="/" className="flex gap-4 mx-auto" />
        <Card className="w-full max-w-md mx-auto mt-10 p-4">
          <Outlet /> {/* child routes render here */}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
