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
        description="Billing arrives once Stripe is integrated: plans are scoped to an organization and priced per seat, so every member you invite counts towards it. Until then every organization has full access."
        variant="card"
      />
    </div>
  );
}
