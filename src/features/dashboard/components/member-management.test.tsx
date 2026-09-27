import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    search,
  }: {
    children: ReactNode;
    to: string;
    search?: { tab: string };
  }) => <a href={`${to}?tab=${search?.tab ?? ""}`}>{children}</a>,
}));
vi.mock("#/features/organizations/hooks/useAcceptInvitation", () => ({
  useAcceptInvitation: () => ({ accept: vi.fn() }),
}));
vi.mock("#/features/organizations/hooks/useDeclineInvitation", () => ({
  useDeclineInvitation: () => ({ decline: vi.fn() }),
}));
vi.mock("#/features/organizations/hooks/useResendInvitation", () => ({
  useResendInvitation: () => ({ resend: vi.fn() }),
}));
vi.mock("#/features/organizations/hooks/useCancelInvitation", () => ({
  useCancelInvitation: () => ({ cancel: vi.fn() }),
}));

import { InvitationsCard } from "./invitations-card";
import { MembersTeamsRow } from "./members-teams-row";
import { OrgPlanRow } from "./org-plan-row";

const expiresAt = new Date(Date.now() + 86400000);
const incoming = [
  {
    id: "incoming",
    status: "pending",
    organizationName: "Inviting organization",
    expiresAt,
  },
];
const sent = [
  { id: "sent", email: "sent@example.com", status: "pending", expiresAt },
];
const org = {
  id: "org",
  name: "Example",
  slug: "example",
  createdAt: new Date(),
  members: [],
  invitations: sent,
};

describe("dashboard member-management visibility", () => {
  it("keeps incoming invitations while hiding organization rows and controls from members", () => {
    render(
      <InvitationsCard
        orgId="org"
        myInvitations={incoming}
        orgInvitations={sent}
        isManager={false}
      />,
    );
    expect(screen.getByText("Inviting organization")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(
      screen.queryByText("Organization invitations"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("sent@example.com")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Resend" }),
    ).not.toBeInTheDocument();
  });
  it("shows organization invitations and quick actions to managers", () => {
    render(
      <InvitationsCard
        orgId="org"
        myInvitations={incoming}
        orgInvitations={sent}
        isManager
      />,
    );
    expect(screen.getByText("Organization invitations")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
  it.each([false, true])(
    "links the member CTA to the correct tab (manager=%s)",
    (isManager) => {
      render(
        <MembersTeamsRow
          orgId="org"
          orgSlug="example"
          members={[]}
          teams={[]}
          currentUserId="self"
          isManager={isManager}
        />,
      );
      const link = screen.getByRole("link", {
        name: isManager ? "Invite member" : "View members",
      });
      expect(link).toHaveAttribute(
        "href",
        `/organizations/$orgId/members?tab=${isManager ? "invitations" : "members"}`,
      );
    },
  );
  it("hides the pending invitation count from ordinary members", () => {
    const view = render(
      <OrgPlanRow
        org={org}
        teams={[]}
        currentUserId="self"
        isManager={false}
      />,
    );
    expect(screen.queryByText("Pending invites")).not.toBeInTheDocument();
    view.rerender(
      <OrgPlanRow org={org} teams={[]} currentUserId="self" isManager />,
    );
    expect(screen.getByText("Pending invites")).toBeInTheDocument();
  });
});
