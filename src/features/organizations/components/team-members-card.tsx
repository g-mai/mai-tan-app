import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";

type TeamMember = {
  id: string;
  user: { name?: string | null; email: string };
};

export function TeamMembersCard({ members }: { members: TeamMember[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>{members.length} total</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {members.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            This team has no members yet.
          </p>
        ) : (
          <ul>
            {members.map((teamMember, i) => (
              <li key={teamMember.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {teamMember.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teamMember.user.email}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
