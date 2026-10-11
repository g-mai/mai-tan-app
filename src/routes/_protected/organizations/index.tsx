import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Plus } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { OrgCard } from "#/features/organizations/components/org-card";

export const Route = createFileRoute("/_protected/organizations/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgs, session } = Route.useRouteContext();
  const activeOrg =
    orgs.find((org) => org.id === session.activeOrganizationId) ?? orgs[0];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Organizations
          </h1>
          <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground text-pretty">
            Your organizations, all in one place. Open an organization to see
            its people, teams, and settings.
          </p>
          <Badge variant="outline">
            {orgs.length} organization{orgs.length === 1 ? "" : "s"}
          </Badge>
        </div>
        <Button asChild className="self-start lg:self-center">
          <Link to="/organizations/new">
            <Plus data-icon="inline-start" />
            New organization
          </Link>
        </Button>
      </header>

      {orgs.length === 0 ? (
        <Empty className="border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No organizations yet</EmptyTitle>
            <EmptyDescription>
              Create an organization to bring your people and teams together.
              Organizations you join will appear here too.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/organizations/new">Create an organization</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <section
          aria-labelledby="organizations-heading"
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-1 pt-2">
            <h2 id="organizations-heading" className="text-base font-semibold">
              Your organizations
            </h2>
            <p className="text-xs text-muted-foreground">
              Switch your active organization in the sidebar.
            </p>
          </div>
          <ul className="grid gap-4 lg:grid-cols-2">
            {orgs.map((org) => (
              <li key={org.id} className="min-w-0">
                <OrgCard org={org} isActive={org.id === activeOrg?.id} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
