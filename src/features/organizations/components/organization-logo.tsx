import { Image } from "@unpic/react";
import { cn } from "#/lib/utils";

export function OrganizationLogo({
  logoUrl,
  height = 120,
  width = 120,
  className = "",
}: {
  logoUrl: string | null | undefined;
  height?: number;
  width?: number;
  className?: string;
}) {
  return (
    <Image
      src={logoUrl || "/default-org.svg"}
      layout="constrained"
      width={width}
      height={height}
      alt="Organization Logo"
      className={cn("max-w-none rounded-md", className)}
    />
  );
}
