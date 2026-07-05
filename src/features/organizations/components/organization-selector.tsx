"use client";

import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Organization } from "#/features/auth/types";
import { OrganizationLogo } from "#/features/organizations/components/organization-logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { organization as orgClient } from "@/features/auth/lib/auth-client";

export type OrganizationSelectorProps = {
  organizations: Organization[];
  activeOrganizationId: string | null | undefined;
  favouriteOrganizationId: string | null | undefined;
};

export function OrganizationSelector({
  organizations,
  activeOrganizationId,
  favouriteOrganizationId,
}: OrganizationSelectorProps) {
  if (organizations.length === 0) {
    // button to create organization
    return (
      <Link to="/organizations/new">
        <Button>Create an Organization</Button>
      </Link>
    );
  }

  const activeOrg =
    organizations.find((org) => org.id === activeOrganizationId) ||
    organizations[0];
  const inactiveOrgs = organizations.filter(
    (org) => org.id !== activeOrganizationId,
  );

  async function setActiveOrganization(orgId: string) {
    const { data, error } = await orgClient.setActive({
      organizationId: orgId,
    });

    if (error) {
      console.error("Failed to set active organization", error);
    } else {
      console.log("Active organization set successfully", data);
      // reload the page to update the active organization
      window.location.reload();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="bg-card flex items-center justify-start gap-2 rounded-md border p-2 shadow-xs">
          <OrganizationLogo
            logoUrl={activeOrg.logo}
            height={40}
            width={40}
            className="size-10 rounded-full border"
          />
          <p className="text-muted-foreground text-sm">{activeOrg.name}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
        side="right"
        align="start"
        sideOffset={6}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="text-muted-foreground flex flex-col items-center gap-2 px-1 py-1.5 text-left text-sm">
            Switch to another organization
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {inactiveOrgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              className="flex items-center gap-2"
              onClick={() => setActiveOrganization(org.id)}
            >
              <OrganizationLogo
                logoUrl={org.logo}
                height={30}
                width={30}
                className="size-7 rounded-full border"
              />
              <span>{org.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground hover:bg-accent rounded-md text-sm">
          <Link to="/organizations/new" className="flex items-center gap-2">
            <Plus size={16} />
            Create a new organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
