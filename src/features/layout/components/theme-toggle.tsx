import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
  type ThemeMode,
  useThemeMode,
} from "#/features/layout/hooks/useThemeToggle";

export default function ThemeToggle() {
  const { mode, setThemeMode } = useThemeMode();

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
    setThemeMode(nextMode);
  }

  const label =
    mode === "auto"
      ? "Theme mode: auto (system). Click to switch to light mode."
      : `Theme mode: ${mode}. Click to switch mode.`;

  return (
    <Button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      variant="outline"
      className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium hover:cursor-pointer"
    >
      {/* {mode === "auto" ? "Auto" : mode === "dark" ? "Dark" : "Light"} */}
      {mode === "auto" && <Monitor className="h-4 w-4" />}
      {mode === "light" && <Sun className="h-4 w-4" />}
      {mode === "dark" && <Moon className="h-4 w-4" />}
    </Button>
  );
}
