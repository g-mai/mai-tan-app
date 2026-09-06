import { Hammer } from "lucide-react";
import { Badge } from "#/components/ui/badge";

export function Wip() {
  return (
    <div className="flex items-start gap-4 rounded-lg border bg-muted bg-[repeating-linear-gradient(135deg,var(--border)_0_1px,transparent_1px_10px)] p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
        <Hammer className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">Work in progress</p>
          <Badge variant="secondary">WIP</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
          This page is still under development and will be updated soon.
        </p>
      </div>
    </div>
  );
}
