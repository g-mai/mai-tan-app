import type { LucideIcon } from "lucide-react";
import { cn } from "#/lib/utils";

type IconCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
};

export function IconCard({
  title,
  description,
  icon: Icon,
  className,
}: IconCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.12),4px_3px_6px_-2px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="mt-3.5 text-[14.5px] font-semibold">{title}</div>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
