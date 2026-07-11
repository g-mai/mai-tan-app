import { Link, useRouter } from "@tanstack/react-router";
import {
  Check,
  Loader2Icon,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeMode } from "../hooks/useThemeToggle";

export function HeaderNavUser({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mode, setThemeMode } = useThemeMode();

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
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col p-1 text-left text-sm">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => setThemeMode("auto")}>
                  <Monitor className="h-4 w-4" />
                  Auto
                  {mode === "auto" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setThemeMode("light")}>
                  <Sun className="h-4 w-4" />
                  Light
                  {mode === "light" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setThemeMode("dark")}>
                  <Moon className="h-4 w-4" />
                  Dark
                  {mode === "dark" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
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
