import { createFileRoute } from "@tanstack/react-router";
import { ChangeEmailSection } from "#/components/auth/change-email-section";
import { ChangePasswordSection } from "#/components/auth/change-password-section";
import { ProfileSection } from "#/components/auth/profile-section";
import { PageTitle } from "#/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, session } = Route.useRouteContext();

  return (
    <div className="w-2xl">
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
    </div>
  );
}
