import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { TeamLogo } from "#/features/organizations/components/team-logo";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  color: string | null;
  description?: string | null;
  organization: { name: string };
};

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      to="/teams/$teamId"
      params={{ teamId: team.id }}
      className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:gap-4 sm:px-6"
    >
      <TeamLogo
        logoUrl={team.logo}
        name={team.name}
        color={team.color}
        size={40}
        className="shrink-0 rounded-lg"
      />
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)] sm:items-center sm:gap-6">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold break-words">{team.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground break-words">
            {team.description || "No description added yet."}
          </p>
        </div>
        <div className="min-w-0">
          <p className="hidden font-mono text-2xs tracking-widest text-muted-foreground uppercase sm:block">
            Organization
          </p>
          <p className="truncate text-xs text-muted-foreground sm:mt-1 sm:text-foreground">
            {team.organization.name}
          </p>
        </div>
      </div>
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  );
}
