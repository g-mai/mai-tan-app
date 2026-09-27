import { Link } from "@tanstack/react-router";
import { SectionPanel } from "#/components/shared/screen-shell";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { RoleBadge } from "#/features/organizations/components/role-badge";

type Member = {
  id: string;
  role: string;
  user: { name?: string | null; email: string; image?: string | null };
};

/** Card rows carry a role badge and hairlines; panel rows lead with an avatar. */
export function MemberList({
  members,
  title = "Members",
  variant = "card",
  className,
  total = members.length,
  organizationId,
}: {
  members: Member[];
  title?: string;
  variant?: "card" | "panel";
  className?: string;
  total?: number;
  organizationId?: string;
}) {
  if (variant === "panel") {
    return (
      <SectionPanel title={title} className={className}>
        <ul className="grid gap-3">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <Avatar className="size-7">
                <AvatarImage
                  src={member.user.image ?? undefined}
                  alt={`${member.user.name}'s avatar`}
                />
                <AvatarFallback className="text-xs">
                  {(member.user.name ?? member.user.email)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {member.user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                {member.role}
              </span>
            </li>
          ))}
        </ul>
      </SectionPanel>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{total} total</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul>
          {members.map((member, i) => (
            <li key={member.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <RoleBadge role={member.role} />
              </div>
            </li>
          ))}
        </ul>
        {organizationId && (
          <div className="px-6 pb-4">
            <Button asChild variant="outline" size="sm">
              <Link
                to="/organizations/$orgId/members"
                params={{ orgId: organizationId }}
                search={{ q: "", page: 1, tab: "members" }}
              >
                View members
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
