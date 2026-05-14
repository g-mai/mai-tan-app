import { createFileRoute, Outlet } from "@tanstack/react-router";
import Footer from "#/components/Footer";
import Header from "#/components/Header";
import { ensureSession } from "#/lib/better-auth/auth-functions";
import { AppSidebar } from "#/components/layout/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "#/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "#/components/ThemeToggle";
import BetterAuthHeader from "#/integrations/better-auth/header-user";

export const Route = createFileRoute("/_protected")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    return session;
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
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
