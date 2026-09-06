import { cn } from "#/lib/utils";

// Amber/blue/neutral as drawn, but tinted rather than fixed hexes in dark mode
// so the badge stays legible on a dark card.
const roleStyles: Record<string, string> = {
  owner: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300",
  admin: "bg-blue-100 text-blue-900 dark:bg-blue-400/15 dark:text-blue-300",
  member: "bg-muted text-muted-foreground",
};

export function RoleBadge({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-2xs font-medium",
        roleStyles[role] ?? roleStyles.member,
        className,
      )}
    >
      {role}
    </span>
  );
}
