import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Bot, Home, Settings2, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { writeNavCookie } from "#/features/layout/lib/nav-state";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavCollapsibleItem, type NavItem } from "./nav-collapsible-item";

const items: NavItem[] = [
  {
    key: "organizations",
    title: "Organizations",
    url: "/organizations",
    icon: SquareTerminal,
    items: [
      { title: "My Orgs", url: "/organizations" },
      { title: "My Teams", url: "/teams" },
    ],
  },
  {
    key: "stack",
    title: "Tech stack",
    url: "/stack",
    icon: Bot,
    items: [
      { title: "Overview", url: "/stack" },
      { title: "Tanstack Start", url: "/stack/tanstack-start" },
      { title: "Better Auth", url: "/stack/better-auth" },
      { title: "Drizzle ORM", url: "/stack/drizzle-orm" },
      // add more items here
    ],
  },
  {
    key: "docs",
    title: "Documentation",
    url: "/docs",
    icon: BookOpen,
    items: [
      { title: "Introduction", url: "/docs" },
      { title: "Get Started", url: "/docs/get-started" },
      { title: "Changelog", url: "/docs/changelog" },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      { title: "User", url: "/settings" },
      { title: "Billing", url: "/settings/billing" },
    ],
  },
];

export function NavMain({ defaultOpenNav }: { defaultOpenNav: string[] }) {
  const location = useLocation();
  const [openItems, setOpenItems] = useState(() => new Set(defaultOpenNav));

  const setOpen = (key: string, open: boolean) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (open) {
        next.add(key);
      } else {
        next.delete(key);
      }
      writeNavCookie(next);
      return next;
    });
  };

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
          <NavCollapsibleItem
            key={item.key}
            item={item}
            open={openItems.has(item.key)}
            onOpenChange={(open) => setOpen(item.key, open)}
            onItemClick={() => setOpen(item.key, true)}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
