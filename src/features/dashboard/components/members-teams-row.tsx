import { Link } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";
import { UserAvatar } from "#/features/auth/components/user-avatar";
import type { User } from "#/features/auth/types";
import { RoleBadge } from "#/features/organizations/components/role-badge";
import { Button } from "@/components/ui/button";

type Member = {
  id: string;
  role: string;
  userId: string;
  user: { name?: string | null; email: string; image?: string | null };
};

type Team = { id: string; name: string; memberCount: number };

export function MembersTeamsRow({
  orgId,
  orgSlug,
  members,
  teams,
  currentUserId,
}: {
  orgId: string;
  orgSlug: string;
  members: Member[];
  teams: Team[];
  currentUserId: string;
}) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-4">
          <div>
            <p className="text-base font-semibold">Members</p>
            <p className="mt-0.5 font-mono text-2xs text-muted-foreground">
              of /{orgSlug}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/organizations/$orgId" params={{ orgId }}>
              Invite member
            </Link>
          </Button>
        </div>
        <ul className="border-t">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-3 border-b px-6 py-3"
            >
              <UserAvatar
                user={
                  {
                    name: member.user.name ?? member.user.email,
                    image: member.user.image,
                  } as User
                }
                height={32}
                width={32}
                className="size-8 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  {member.user.name || member.user.email}
                </p>
                <p className="truncate font-mono text-2xs text-muted-foreground">
                  {member.user.email}
                </p>
              </div>
              {member.userId === currentUserId && (
                <span className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-2xs text-muted-foreground">
                  you
                </span>
              )}
              <RoleBadge role={member.role} />
            </li>
          ))}
        </ul>
        {members.length <= 1 ? (
          <p className="px-6 py-4 text-xs leading-relaxed text-muted-foreground text-pretty">
            Nobody else yet. Invite by email and they land here as{" "}
            <code className="rounded-sm border bg-muted px-1.5 py-0.5 font-mono text-xs">
              member
            </code>{" "}
            — invitations you send show their status until accepted.
          </p>
        ) : (
          <p className="px-6 py-3 text-xs text-muted-foreground">
            Roles decide what a member can change.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
          <p className="text-base font-semibold">Teams</p>
          {teams.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link to="/teams/new">New team</Link>
            </Button>
          )}
        </div>
        {teams.length > 0 ? (
          <>
            <ul className="border-t">
              {teams.map((team) => (
                <li key={team.id}>
                  <Link
                    to="/teams/$teamId"
                    params={{ teamId: team.id }}
                    className="flex items-center gap-3 border-b px-5 py-3 transition-colors hover:bg-accent"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                      <Users className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {team.name}
                      </span>
                      <span className="block font-mono text-2xs text-muted-foreground">
                        {team.memberCount} member
                        {team.memberCount === 1 ? "" : "s"}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="px-5 py-3 text-xs leading-relaxed text-muted-foreground">
              A team is a subset of an org — same billing, narrower access.
            </p>
          </>
        ) : (
          <div className="border-t p-5">
            <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4">
              <Users className="size-5 text-muted-foreground" />
              <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
                No teams yet. A team is a subset of your org — same billing,
                narrower access. Optional.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/teams/new">Create a team</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
