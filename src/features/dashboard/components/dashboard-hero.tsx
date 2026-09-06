import { Link } from "@tanstack/react-router";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import { Button } from "@/components/ui/button";

export function DashboardHero({
  firstName,
  chips,
  role,
  orgId,
}: {
  firstName: string;
  chips: string[];
  role?: string;
  orgId?: string;
}) {
  return (
    <div className="flex flex-col gap-7 rounded-xl border bg-card p-7 shadow-sm sm:flex-row sm:items-center sm:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground text-pretty">
          Everything this app does sits in the rail on the left: your
          organization and the people in it, plus docs for the stack underneath.
          Start with the org.
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-full border bg-card px-2.5 py-1 font-mono text-xs"
            >
              {chip}
            </span>
          ))}
          {role && <RoleBadge role={role} />}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:w-59">
        {orgId && (
          <Button asChild>
            <Link to="/organizations/$orgId" params={{ orgId }}>
              Open your organization
            </Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/docs">Browse the docs</Link>
        </Button>
      </div>
    </div>
  );
}
