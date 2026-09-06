import { Link } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { RoleBadge } from "#/features/organizations/components/role-badge";

type Org = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date | string;
};

export function OrgPlanRow({
  org,
  role,
  memberCount,
  teamCount,
  pendingInviteCount,
}: {
  org: Org;
  role?: string;
  memberCount: number;
  teamCount: number;
  pendingInviteCount: number;
}) {
  const created = new Date(org.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const stats = [
    { label: "Members", value: memberCount },
    { label: "Teams", value: teamCount },
    { label: "Pending invites", value: pendingInviteCount },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-2">
        <div className="flex items-center gap-4 px-6 py-5">
          <OrganizationLogo
            logoUrl={org.logo}
            height={44}
            width={44}
            className="size-11 shrink-0 rounded-xl border bg-muted shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold tracking-tight">
              {org.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-2xs text-muted-foreground">
              /{org.slug} · created {created}
            </p>
          </div>
          {role && <RoleBadge role={role} />}
        </div>
        <div className="grid grid-cols-3 border-t">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-4 not-last:border-r">
              <p className="font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-5 border-t px-6 py-3 text-xs">
          <Link
            to="/organizations/$orgId/edit"
            params={{ orgId: org.id }}
            className="text-primary hover:underline"
          >
            Organization settings
          </Link>
          <Link
            to="/organizations/$orgId"
            params={{ orgId: org.id }}
            className="text-primary hover:underline"
          >
            Members
          </Link>
          <Link to="/teams" className="text-primary hover:underline">
            Teams
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card px-6 py-5 shadow-sm">
        <div className="flex items-center gap-2 text-secondary">
          <CreditCard className="size-4" />
          <span className="font-mono text-2xs tracking-widest uppercase">
            Plan
          </span>
        </div>
        <p className="text-xl font-semibold tracking-tight">Full access</p>
        <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
          Billing arrives with Stripe — per seat, scoped to the org. Until then
          every organization has full access.
        </p>
        <Link
          to="/settings/billing"
          className="mt-auto text-xs text-primary hover:underline"
        >
          Settings → Billing
        </Link>
      </div>
    </div>
  );
}
