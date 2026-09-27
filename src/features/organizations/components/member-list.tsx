import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SectionPanel } from "#/components/shared/screen-shell";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import { cn } from "#/lib/utils";

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
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="p-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {total} member{total === 1 ? "" : "s"}
        </CardDescription>
        {organizationId && (
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link
                to="/organizations/$orgId/members"
                params={{ orgId: organizationId }}
                search={{ q: "", page: 1, tab: "members" }}
              >
                View all members
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ul>
          {members.map((member, i) => (
            <li key={member.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center gap-3 px-5 py-4">
                <Avatar className="size-9 shrink-0">
                  <AvatarImage src={member.user.image ?? undefined} alt="" />
                  <AvatarFallback>
                    {(member.user.name || member.user.email)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-medium">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <RoleBadge role={member.role} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
