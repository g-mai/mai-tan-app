import { cn } from "#/lib/utils";

/** Hairline grid page backdrop — the flat off-white/near-black plus 32px rules. */
export function GridBackdrop({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]",
        "bg-size-[32px_32px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ScreenCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Terminal strip: the route path is the screen's title bar. */
export function ScreenStrip({
  path,
  state,
  tone = "muted",
}: {
  path: string;
  state?: string;
  tone?: "muted" | "primary" | "secondary" | "destructive";
}) {
  return (
    <div className="flex h-9 items-center justify-between gap-3 border-b bg-muted px-4">
      <span className="truncate font-mono text-[11px] text-muted-foreground">
        {path}
      </span>
      {state && (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]",
            tone === "muted" && "border bg-card text-muted-foreground",
            tone === "primary" && "border bg-card text-primary",
            tone === "secondary" && "bg-secondary text-secondary-foreground",
            tone === "destructive" &&
              "border border-destructive text-destructive",
          )}
        >
          {state}
        </span>
      )}
    </div>
  );
}

/** The single header pattern every screen uses. */
export function ScreenHeader({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-4", icon ? "items-start" : "flex-col")}>
      {icon && (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        {/* Two-paragraph explanations get a quiet rule instead of a wall of grey. */}
        {children && (
          <div className="mt-2 grid gap-2 border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function ScreenBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

/** Muted footer row: secondary links on auth, the Continue button on onboarding. */
export function ScreenFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t bg-muted px-6 py-3.5 text-sm text-muted-foreground",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Replaces a nested Card inside the onboarding shell: hairline, no second shadow. */
export function SectionPanel({
  title,
  description,
  action,
  className,
  children,
  variant,
}: {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  variant?: "panel" | "card";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border",
        variant === "card" && "shadow-md",
        className,
      )}
    >
      {(title || description || action) && (
        <div
          className={cn(
            "flex items-start justify-between bg-muted gap-3 border-b px-4 py-3",
            variant === "card" && "bg-card",
          )}
        >
          <div className="min-w-0">
            {title && <p className="text-sm font-semibold">{title}</p>}
            {description && (
              <p className="mt-1 text-xs text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children && <div className="p-4 bg-card">{children}</div>}
    </div>
  );
}
