import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import type { Organization } from "#/features/auth/types";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { formatDate } from "#/lib/format";

export function OrgCard({
  org,
  isActive,
}: {
  org: Organization;
  isActive: boolean;
}) {
  return (
    <Card className="h-full gap-4 pb-0">
      <CardHeader>
        <div className="flex items-start gap-3">
          <OrganizationLogo
            logoUrl={org.logo}
            height={44}
            width={44}
            className="size-11 shrink-0 rounded-xl border bg-muted"
          />
          <div className="min-w-0 flex-1">
            <CardTitle>
              <h3>
                <Link
                  to="/organizations/$orgId"
                  params={{ orgId: org.id }}
                  className="rounded-sm break-words hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {org.name}
                </Link>
              </h3>
            </CardTitle>
            <p className="mt-2 truncate font-mono text-xs text-muted-foreground">
              /{org.slug}
            </p>
          </div>
          {isActive && <Badge variant="secondary">Active</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground break-words">
          {org.description || "No description added yet."}
        </p>
        <p className="mt-auto text-xs text-muted-foreground">
          Created {formatDate(org.createdAt, "short")}
        </p>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2 border-t py-3 [.border-t]:pt-3">
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/organizations/$orgId/members"
            params={{ orgId: org.id }}
            search={{ q: "", page: 1, tab: "members" }}
          >
            Members
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/organizations/$orgId" params={{ orgId: org.id }}>
            Open organization
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
