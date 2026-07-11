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
        <div className="bg-card flex items-center justify-start gap-2 rounded-full py-2 px-4 shadow-xs">
          <OrganizationLogo
            logoUrl={activeOrg.logo}
            height={32}
            width={32}
            className="size-6 rounded-full border"
          />
          <p className="text-muted-foreground text-sm">{activeOrg.name}</p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-64 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={6}
      >
        <DropdownMenuLabel className="font-normal p-2 text-muted-foreground text-sm">
          Switch to another organization
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {inactiveOrgs.map((org) => (
            <DropdownMenuItem
              key={org.id}
              className="flex items-center p-2 gap-2"
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
        <DropdownMenuItem className=" hover:bg-accent rounded-md text-sm p-2">
          <Link to="/organizations/new" className="flex items-center gap-2">
            <Plus size={16} />
            Create a new organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
