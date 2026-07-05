import { Link, useRouter } from "@tanstack/react-router";
import { Loader2Icon, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "#/features/auth/components/user-avatar";
import { signOut } from "#/features/auth/lib/auth-client";
import type { User } from "#/features/auth/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HeaderNavUser({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout(event: React.MouseEvent) {
    // prevent menu from closing immediately
    event.preventDefault();

    setLoading(true);
    try {
      await signOut();
      toast.success("You have been logged out successfully.");
      await router.navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      setLoading(false);
      console.error("Logout error:", error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <UserAvatar
          user={user}
          height={30}
          width={30}
          className="rounded-full size-10"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="z-102 w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={6}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar
              user={user}
              height={120}
              width={120}
              className="size-10"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          {loading ? <Loader2Icon className="animate-spin" /> : <LogOut />}
          {loading ? "Logging out..." : "Log out"}{" "}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
