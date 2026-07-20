import { Link } from "@tanstack/react-router";

import { Command } from "lucide-react";

export function LogoTitle({
  className = "flex gap-4 items-center py-2",
  href = "/dashboard",
  ...props
}) {
  return (
    <Link to={href} className={className} {...props}>
      <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <Command className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate text-lg">mai_tan/app</span>
      </div>
    </Link>
  );
}
