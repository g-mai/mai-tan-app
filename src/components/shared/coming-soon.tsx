import { Construction } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { cn } from "#/lib/utils";

export function ComingSoon({
  title,
  description,
  variant = "panel",
}: {
  title: string;
  description: string;
  variant?: "panel" | "card";
}) {
  // Construction hatching instead of a second card inside the shell.
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border bg-[repeating-linear-gradient(135deg,var(--border)_0_1px,transparent_1px_10px)] p-4",
        variant === "card" ? "bg-card shadow" : "bg-muted",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
        <Construction className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{title}</p>
          <Badge variant="secondary">Coming soon</Badge>
        </div>
        <p className="mt-2 max-w-[52ch] text-xs leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
    </div>
  );
}
