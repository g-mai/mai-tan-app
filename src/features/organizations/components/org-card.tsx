import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";

type Org = {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
};

export function OrgCard({ org }: { org: Org }) {
  return (
    <Link to="/organizations/$orgId" params={{ orgId: org.id }}>
      <Card className="min-w-sm cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-4">
            <OrganizationLogo logoUrl={org.logo} height={48} width={48} />
            <CardTitle>{org.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {org.description || "No description"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
