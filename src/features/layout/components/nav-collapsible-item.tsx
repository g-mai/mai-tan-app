import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export type NavItem = {
  key: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: { title: string; url: string }[];
};

type NavCollapsibleItemProps = {
  item: NavItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemClick: () => void;
};

export function NavCollapsibleItem({
  item,
  open,
  onOpenChange,
  onItemClick,
}: NavCollapsibleItemProps) {
  const location = useLocation();
  const isActive =
    item.url === location.pathname ||
    item.items?.some((subItem) => subItem.url === location.pathname);

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={onOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
          <Link
            to={item.url}
            onClick={onItemClick}
            className="flex items-center gap-2"
          >
            {item.icon && <item.icon size={16} />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.items?.length ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90 hover:cursor-pointer">
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
                        activeProps={{ className: "underline bg-amber-100" }}
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
  );
}
