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

// Shared row shape: muted by default, active rows get the hairline + hard
// shadow and a primary-tinted icon.
export const navMenuButtonClassName =
  "h-auto gap-3 rounded-lg border border-transparent px-3 py-2 text-muted-foreground hover:text-sidebar-foreground data-[active=true]:border-sidebar-border data-[active=true]:font-normal data-[active=true]:shadow-xs data-[active=true]:[&_svg]:text-primary";

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
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isActive}
          className={navMenuButtonClassName}
        >
          <Link to={item.url} onClick={onItemClick}>
            {item.icon && <item.icon size={16} />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.items?.length ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="top-2.5 text-muted-foreground opacity-70 hover:cursor-pointer data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle {item.title}</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="mt-0.5 mr-0 mb-2 ml-6 gap-px py-0 pr-0 pl-3">
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={subItem.url === location.pathname}
                      className="h-auto rounded-lg px-2 py-1 text-muted-foreground hover:text-sidebar-foreground"
                    >
                      <Link to={subItem.url} activeOptions={{ exact: true }}>
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
