import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar";
import { ensureSession } from "#/features/auth/lib/auth.functions";
import { AppSidebar } from "#/features/layout/components/app-sidebar";
import Footer from "#/features/layout/components/footer";
import BetterAuthHeader from "#/features/layout/components/header-user";
import ThemeToggle from "#/features/layout/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_protected")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    return session;
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const context = Route.useRouteContext();
  console.log("[ProtectedLayout] context", context);
  // return (
  //   <div className="min-h-screen flex flex-col">
  //     <Header />
  //     <main className="flex-1 p-8 max-w-5xl m-auto">
  //       <Outlet />
  //     </main>
  //     <Footer />
  //   </div>
  // );
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center justify-between gap-2 px-3">
            <div>
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            {/*<Header />*/}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <BetterAuthHeader />
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 max-w-5xl m-auto">
          <Outlet />
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
