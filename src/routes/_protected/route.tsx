import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar";
import { ensureSession } from "#/features/auth/lib/auth.functions";
import { AppSidebar } from "#/features/layout/components/app-sidebar";
import Footer from "#/features/layout/components/footer";
import { HeaderNavUser } from "#/features/layout/components/header-nav-user";
import ThemeToggle from "#/features/layout/components/theme-toggle";
import {
  getNavOpenState,
  getSidebarState,
} from "#/features/layout/lib/nav-state";
import { OrganizationSelector } from "#/features/organizations/components/organization-selector";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_protected")({
  beforeLoad: (ctx) => {
    const session = ensureSession(ctx);
    return session;
  },
  loader: async () => ({
    openNav: await getNavOpenState(),
    sidebarOpen: await getSidebarState(),
  }),
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const session = Route.useRouteContext();
  const { openNav, sidebarOpen } = Route.useLoaderData();

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar session={session} defaultOpenNav={openNav} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center justify-between gap-2 px-3">
            <div>
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <OrganizationSelector
                organizations={session.orgs}
                activeOrganizationId={session.session.activeOrganizationId}
                favouriteOrganizationId={session.user.favouriteOrganization}
              />
              <HeaderNavUser user={session.user} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 max-w-5xl m-auto w-full">
          <Outlet />
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
