import { LogoTitle } from "#/components/shared/logo-title";
import type { Session } from "#/features/auth/types";
import { OrganizationSelector } from "#/features/organizations/components/organization-selector";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { SidebarNavUser } from "./sidebar-nav-user";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  session: Session;
  defaultOpenNav: string[];
};

export function AppSidebar({
  session,
  defaultOpenNav,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-0 p-0">
        <LogoTitle
          href="/dashboard"
          className="flex items-center gap-3 px-4 pt-4 pb-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:[&>div:last-child]:hidden [&_span]:text-base [&_span]:font-medium [&_span]:tracking-[-0.01em]"
        />
        <div className="px-3 pt-1 pb-3 group-data-[collapsible=icon]:px-2">
          <OrganizationSelector
            organizations={session.orgs}
            activeOrganizationId={session.session.activeOrganizationId}
          />
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <NavMain defaultOpenNav={defaultOpenNav} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:px-2">
        <SidebarNavUser user={session.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
