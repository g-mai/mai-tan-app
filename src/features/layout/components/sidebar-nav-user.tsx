import { Link, useRouter } from "@tanstack/react-router";
import {
  ChevronsUpDown,
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { type ThemeMode, useThemeMode } from "../hooks/useThemeToggle";

const themeModes = [
  { mode: "auto", label: "Auto", icon: Monitor },
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
] satisfies { mode: ThemeMode; label: string; icon: typeof Monitor }[];

export function SidebarNavUser({ user }: { user: User }) {
  const router = useRouter();
  const { isMobile } = useSidebar();
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
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-colors hover:border-sidebar-border hover:bg-sidebar-accent group-data-[collapsible=icon]:p-0">
        <UserAvatar
          user={user}
          height={32}
          width={32}
          className="size-8 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm text-sidebar-foreground">
            {user.name}
          </p>
          <p className="truncate font-mono text-2xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl p-2"
        side={isMobile ? "bottom" : "top"}
        align="start"
        sideOffset={6}
      >
        <div className="flex items-center gap-3 px-2 pt-2 pb-3">
          <UserAvatar
            user={user}
            height={32}
            width={32}
            className="size-8 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm">{user.name}</p>
            <p className="truncate font-mono text-2xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0" />

        <div className="px-2 py-3">
          <p className="mb-2 font-mono text-2xs tracking-widest text-muted-foreground uppercase">
            Theme
          </p>
          <div className="flex gap-2">
            {themeModes.map((option) => (
              <button
                key={option.mode}
                type="button"
                aria-pressed={mode === option.mode}
                onClick={() => setThemeMode(option.mode)}
                className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border bg-card py-2 transition-colors hover:bg-accent"
              >
                <option.icon className="size-4" />
                <span className="text-2xs">{option.label}</span>
                <span className="flex h-1 items-center">
                  {mode === option.mode && (
                    <span className="size-1 rounded-full bg-primary" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0" />

        <DropdownMenuItem asChild className="mt-2 gap-2 rounded-lg p-2 text-sm">
          <Link to="/settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="gap-2 rounded-lg p-2 text-sm"
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          {loading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
