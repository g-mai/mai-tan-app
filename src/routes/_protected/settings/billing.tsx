import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "#/components/shared/coming-soon";
import { PageTitle } from "#/components/shared/page-title";

export const Route = createFileRoute("/_protected/settings/billing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-2xl flex flex-col gap-4">
      <PageTitle
        title="Billing"
        subtitle="Manage your organization's subscription and payment methods"
      />
      <ComingSoon
        title="Billing & subscriptions"
        description="Plan management, invoices, and payment methods are on their way."
      />
    </div>
  );
}
