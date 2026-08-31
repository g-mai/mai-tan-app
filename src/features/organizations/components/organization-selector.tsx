"use client";

import { Link, useRouter } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import type { Organization } from "#/features/auth/types";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { organization as orgClient } from "@/features/auth/lib/auth-client";

export type OrganizationSelectorProps = {
  organizations: Organization[];
  activeOrganizationId: string | null | undefined;
};

export function OrganizationSelector({
  organizations,
  activeOrganizationId,
}: OrganizationSelectorProps) {
  const router = useRouter();
  if (organizations.length === 0) {
    // button to create organization
    return (
      <Link to="/organizations/new">
        <Button>Create an Organization</Button>
      </Link>
    );
  }

  // TODO: add button to go to current org settings or show more info about current org

  const activeOrg =
    organizations.find((org) => org.id === activeOrganizationId) ??
    organizations[0];
  const inactiveOrgs = organizations.filter((org) => org.id !== activeOrg.id);

  async function setActiveOrganization(orgId: string) {
    const { data, error } = await orgClient.setActive({
      organizationId: orgId,
    });

    if (error) {
      console.error("Failed to set active organization", error);
    } else {
      console.log("Active organization set successfully", data);
      // reload the page to update the active organization
      await router.invalidate();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-2 text-left shadow-xs transition-colors hover:border-muted-foreground group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
        <OrganizationLogo
          logoUrl={activeOrg.logo}
          height={32}
          width={32}
          className="size-8 shrink-0 rounded-lg border bg-muted"
        />
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm text-sidebar-foreground">
            {activeOrg.name}
          </p>
          <p className="truncate font-mono text-2xs text-muted-foreground">
            /{activeOrg.slug}
          </p>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl p-2"
        side="bottom"
        align="start"
        sideOffset={6}
      >
        <p className="px-2 pt-1 pb-2 font-mono text-2xs tracking-widest text-muted-foreground uppercase">
          {inactiveOrgs.length > 0
            ? "Switch organization"
            : "Your organizations"}
        </p>
        <DropdownMenuGroup>
          {inactiveOrgs.length > 0 ? (
            inactiveOrgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="gap-2 rounded-lg p-2 text-sm"
                onClick={() => setActiveOrganization(org.id)}
              >
                <OrganizationLogo
                  logoUrl={org.logo}
                  height={24}
                  width={24}
                  className="size-6 shrink-0 rounded-lg border bg-muted"
                />
                <span className="flex-1 truncate">{org.name}</span>
                <span className="font-mono text-2xs text-muted-foreground">
                  /{org.slug}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-accent p-2 text-sm">
              <OrganizationLogo
                logoUrl={activeOrg.logo}
                height={24}
                width={24}
                className="size-6 shrink-0 rounded-lg border bg-card"
              />
              <span className="flex-1 truncate">{activeOrg.name}</span>
              <Check className="size-4 shrink-0 text-primary" />
            </div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-0" />
        <DropdownMenuItem asChild className="gap-2 rounded-lg p-2 text-sm">
          <Link to="/organizations/new">
            <Plus className="size-4" />
            Create a new organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
