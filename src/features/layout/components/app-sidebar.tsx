import { LogoTitle } from "#/components/shared/logo-title";
import type { Session } from "#/features/auth/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

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
      <SidebarHeader>
        <LogoTitle href="/dashboard" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain defaultOpenNav={defaultOpenNav} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
