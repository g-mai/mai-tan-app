import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { LogoTitle } from "#/components/shared/logo-title";
import type { Session } from "#/features/auth/types";
import { OrganizationSelector } from "#/features/organizations/components/organization-selector";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  session: Session;
};

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <LogoTitle href="/dashboard" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>Your orgs</SidebarGroupLabel>
          <OrganizationSelector
            organizations={session.orgs}
            activeOrganizationId={session.session.activeOrganizationId}
            favouriteOrganizationId={session.user.favouriteOrganization}
          />
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
