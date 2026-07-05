import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { ActiveSessionsSection } from "#/features/auth/components/active-sessions-section";
import { ChangeEmailSection } from "#/features/auth/components/change-email-section";
import { ChangePasswordSection } from "#/features/auth/components/change-password-section";
import { ProfileSection } from "#/features/auth/components/profile-section";
import { getAllSessions } from "#/features/auth/lib/auth.functions";

export const Route = createFileRoute("/_protected/settings/")({
  component: RouteComponent,
  loader: async () => {
    const sessions = await getAllSessions();
    return sessions;
  },
});

function RouteComponent() {
  const { user, session } = Route.useRouteContext();
  const sessions = Route.useLoaderData();

  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />
      <ProfileSection user={user} />
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChangeEmailSection user={user} />
          <ChangePasswordSection />
        </CardContent>
      </Card>
      <ActiveSessionsSection
        sessions={sessions}
        currentSessionId={session.id}
      />
    </div>
  );
}
