import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  ChevronRight,
  Home,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain() {
  const items = [
    {
      title: "Organizations",
      url: "/organizations",
      icon: SquareTerminal,
      items: [
        {
          title: "My Orgs",
          url: "/organizations",
        },
        {
          title: "My Teams",
          url: "/teams",
        },
      ],
    },
    {
      title: "Tech stack",
      url: "/stack",
      icon: Bot,
      items: [
        {
          title: "Tanstack Start",
          url: "/stack/tanstack-start",
        },
        {
          title: "Better Auth",
          url: "/stack/better-auth",
        },
        {
          title: "Drizzle ORM",
          url: "/stack/drizzle-orm",
        },
        // add more items here
      ],
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "/docs",
        },
        {
          title: "Get Started",
          url: "/docs/get-started",
        },
        {
          title: "Changelog",
          url: "/docs/changelog",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "User",
          url: "/settings",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
      ],
    },
  ];

  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenuButton isActive={location.pathname === "/dashboard"} asChild>
        <Link
          to="/dashboard"
          activeProps={{ className: "underline bg-sidebar-accent" }}
        >
          <Home />
          Dashboard
        </Link>
      </SidebarMenuButton>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={
              item.url === location.pathname ||
              item.items?.some((subItem) => subItem.url === location.pathname)
            }
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={
                  item.url === location.pathname ||
                  item.items?.some(
                    (subItem) => subItem.url === location.pathname,
                  )
                }
              >
                <Link
                  to={item.url}
                  // activeProps={{ className: "underline bg-sidebar-accent" }}
                  className="flex items-center gap-2"
                >
                  {item.icon && <item.icon size={16} />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle {item.title}</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.url === location.pathname}
                          >
                            <Link
                              to={subItem.url}
                              activeProps={{
                                className: "underline bg-amber-100",
                              }}
                              activeOptions={{ exact: true }}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
