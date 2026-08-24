import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/docs/changelog")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Changelog" subtitle="Notable changes by version." />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>v0.1.3</CardTitle>
            <Badge variant="secondary">Latest</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Registration is now email-first: enter your address, confirm a
              6-digit code, then choose a password.
            </li>
            <li>
              New accounts are guided through a step-by-step setup — profile,
              organization, plan, team and invitations — which remembers where
              you left off if you close the tab.
            </li>
            <li>
              Invite teammates by email, resend or cancel a pending invitation,
              and see who has already joined.
            </li>
            <li>
              Accepting an invitation skips the setup steps that belong to the
              organization's owner.
            </li>
            <li>
              Delete your account permanently from Settings. Organizations you
              are the only owner of are named up front before they go with it.
            </li>
            <li>
              The active organization is always valid now, even after leaving or
              deleting one.
            </li>
            <li>
              A maintenance job clears out registrations abandoned before the
              password step.
            </li>
            <li>The removable guest/demo login has been retired.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>v0.1.2</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Redesigned marketing homepage with a live app preview.</li>
            <li>Buttons now have a pressed/tactile micro-interaction.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>v0.1.1</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Create and edit organizations from dedicated routes.</li>
            <li>Create and edit teams within an organization.</li>
            <li>
              Collapsible sidebar navigation with persisted open/closed state.
            </li>
            <li>Theme toggle moved into the user menu.</li>
            <li>
              Refreshed organization selector and cleaned up unused layout
              components.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>v0.1.0</CardTitle>
            <Badge variant="secondary">Initial release</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            First public version: authentication, multi-tenant organizations and
            teams, user settings, and the core app shell.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
