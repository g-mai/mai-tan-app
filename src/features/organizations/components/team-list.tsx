import { SectionPanel } from "#/components/shared/screen-shell";
import { TeamLogo } from "#/features/organizations/components/team-logo";

type Team = {
  id: string;
  name: string;
  logo?: string | null;
  color: string | null;
};

export function TeamList({ teams, title }: { teams: Team[]; title: string }) {
  return (
    <SectionPanel title={title}>
      <ul className="grid gap-3">
        {teams.map((team) => (
          <li key={team.id} className="flex items-center gap-3">
            <TeamLogo
              logoUrl={team.logo}
              name={team.name}
              color={team.color}
              size={28}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{team.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}
