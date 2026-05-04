import { Image } from "@unpic/react";
import type { User } from "#/types/auth-types";

export function UserAvatar({
  user,
  height = 120,
  width = 120,
  className = "",
}: {
  user: User;
  height: number;
  width: number;
  className?: string;
}) {
  const avatarUrl =
    user.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=256`;
  return (
    <Image
      src={avatarUrl}
      layout="constrained"
      width={width}
      height={height}
      alt={`${user.name}'s avatar`}
      className={`rounded-2xl ${className}`}
    />
  );
}
