import { Image } from "@unpic/react";
import { DEFAULT_TEAM_COLOR } from "#/features/organizations/hooks/useUpdateTeam";
import { cn } from "#/lib/utils";

export function TeamLogo({
  logoUrl,
  name,
  color,
  size = 120,
  className = "",
}: {
  logoUrl: string | null | undefined;
  name: string;
  color: string | null | undefined;
  size?: number;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        layout="constrained"
        width={size}
        height={size}
        alt={`${name} logo`}
        className={cn("max-w-none rounded-md", className)}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: color || DEFAULT_TEAM_COLOR,
        width: size,
        height: size,
        fontSize: size / 2.5,
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-semibold text-white",
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
