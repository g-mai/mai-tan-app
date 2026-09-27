import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import type { MemberRow } from "#/features/organizations/lib/member-management";

export function MemberTargetList({ members }: { members: MemberRow[] }) {
  return (
    <ul
      aria-label="Selected members"
      className="max-h-44 overflow-y-auto rounded-lg border bg-muted/30 divide-y"
    >
      {members.map((member) => (
        <li key={member.userId} className="flex items-center gap-3 px-4 py-3">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={member.image ?? undefined} alt="" />
            <AvatarFallback>
              {(member.name || member.email).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-sm font-medium">
              {member.name || member.email}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {member.email}
            </p>
          </div>
          <RoleBadge role={member.role} />
        </li>
      ))}
    </ul>
  );
}
