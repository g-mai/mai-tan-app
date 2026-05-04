import { ProfileSection } from "#/components/auth/profile-section";
import { PageTitle } from "#/components/shared/PageTitle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient, user, session } = Route.useRouteContext();

  return (
    <div className="w-2xl">
      <PageTitle
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />
      <ProfileSection user={user} />
    </div>
  );
}
