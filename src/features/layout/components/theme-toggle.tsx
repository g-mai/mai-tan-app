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
      size="icon"
      className="rounded-full hover:cursor-pointer"
    >
      {mode === "auto" && (
        <Monitor data-icon="inline-start" aria-hidden="true" />
      )}
      {mode === "light" && <Sun data-icon="inline-start" aria-hidden="true" />}
      {mode === "dark" && <Moon data-icon="inline-start" aria-hidden="true" />}
    </Button>
  );
}
