import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { Fragment } from "react";
import { cn } from "#/lib/utils";

// Dynamic segments ($orgId, $teamId) render as raw ids unless the matched
// route already loaded something we can name them with.
function resolvedParamLabels(matches: ReturnType<typeof useMatches>) {
  const labels = new Map<string, string>();

  for (const match of matches) {
    const data = match.loaderData as
      | { name?: string; slug?: string }
      | undefined;
    const label = data?.slug ?? data?.name;
    if (!label) continue;

    for (const value of Object.values(match.params ?? {})) {
      if (typeof value === "string") labels.set(value, label);
    }
  }

  return labels;
}

export function HeaderBreadcrumb({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const labels = resolvedParamLabels(useMatches());

  const segments = pathname.split("/").filter(Boolean);
  const lastIndex = segments.length - 1;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex min-w-0 items-center gap-3 font-mono text-xs",
        className,
      )}
    >
      <Link
        to="/dashboard"
        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        mai_tan/app
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label = labels.get(segment) ?? segment;

        return (
          <Fragment key={href}>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            {index === lastIndex ? (
              <span aria-current="page" className="truncate text-foreground">
                {label}
              </span>
            ) : (
              <Link
                to={href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
