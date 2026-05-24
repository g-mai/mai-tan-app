import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { ChangeEmailSection } from "#/features/auth/components/change-email-section";
import { ChangePasswordSection } from "#/features/auth/components/change-password-section";
import { ProfileSection } from "#/features/auth/components/profile-section";

export const Route = createFileRoute("/_protected/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, session } = Route.useRouteContext();

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
    </div>
  );
}
