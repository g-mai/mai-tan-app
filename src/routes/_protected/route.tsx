import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BookOpen, GitBranch } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar";
import { ensureSession } from "#/features/auth/lib/auth.functions";
import { AppSidebar } from "#/features/layout/components/app-sidebar";
import Footer from "#/features/layout/components/footer";
import { HeaderBreadcrumb } from "#/features/layout/components/header-breadcrumb";
import {
  getNavOpenState,
  getSidebarState,
} from "#/features/layout/lib/nav-state";
import { ensureOnboardingComplete } from "#/features/onboarding/lib/onboarding";

export const Route = createFileRoute("/_protected")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    ensureOnboardingComplete(ctx);
    return session;
  },
  loader: async () => ({
    openNav: await getNavOpenState(),
    sidebarOpen: await getSidebarState(),
  }),
  component: ProtectedLayout,
});

const headerLinkClassName =
  "flex h-8 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

function ProtectedLayout() {
  const session = Route.useRouteContext();
  const { openNav, sidebarOpen } = Route.useLoaderData();

  return (
    <SidebarProvider
      defaultOpen={sidebarOpen}
      style={{ "--sidebar-width": "16.5rem" } as React.CSSProperties}
    >
      <AppSidebar session={session} defaultOpenNav={openNav} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-header-bg px-6 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-1.5 shrink-0 text-muted-foreground" />
            <HeaderBreadcrumb className="ml-8" />
          </div>
          <nav className="flex shrink-0 items-center gap-2">
            <Link to="/docs" className={headerLinkClassName}>
              <BookOpen className="size-4" />
              Docs
            </Link>
            <a
              href="https://github.com/g-mai/mai-tan-app"
              target="_blank"
              rel="noopener noreferrer"
              className={headerLinkClassName}
            >
              <GitBranch className="size-4" />
              GitHub
            </a>
          </nav>
        </header>
        <main className="flex-1 p-8 max-w-5xl m-auto w-full">
          <Outlet />
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
