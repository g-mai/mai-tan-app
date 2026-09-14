import type { ReactNode } from "react";

export type ChangelogEntry = {
  version: string;
  badge?: string;
  /** Rendered as a paragraph; used when a release has no itemised list. */
  summary?: ReactNode;
  changes?: ReactNode[];
};

/** Newest first. Entries carry markup, hence a .tsx data module. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v0.1.4",
    badge: "Latest",
    changes: [
      "Redesigned dashboard: a welcome panel with your organization at a glance, plan and usage, members and teams, and your invitations.",
      "Incoming invitations now show who sent them, and can be accepted or declined straight from the dashboard.",
      "Redesigned sidebar: the organization switcher sits at the top, the user menu moved down into the footer, and the header now shows breadcrumbs for where you are.",
      "Pages that are still being built now say so, instead of looking finished.",
      "The dashboard explains how to run the project locally, with the commands to copy and a ready-made prompt for a coding agent.",
      <>
        Rewritten README and <code>.env.example</code>: working local defaults,
        step-by-step setup, seeded logins, a troubleshooting table, and a
        reference for every environment variable.
      </>,
    ],
  },
  {
    version: "v0.1.3",
    changes: [
      "Registration is now email-first: enter your address, confirm a 6-digit code, then choose a password.",
      "New accounts are guided through a step-by-step setup — profile, organization, plan, team and invitations — which remembers where you left off if you close the tab.",
      "Invite teammates by email, resend or cancel a pending invitation, and see who has already joined.",
      "Accepting an invitation skips the setup steps that belong to the organization's owner.",
      "Delete your account permanently from Settings. Organizations you are the only owner of are named up front before they go with it.",
      "The active organization is always valid now, even after leaving or deleting one.",
      "A maintenance job clears out registrations abandoned before the password step.",
      "The removable guest/demo login has been retired.",
    ],
  },
  {
    version: "v0.1.2",
    changes: [
      "Redesigned marketing homepage with a live app preview.",
      "Buttons now have a pressed/tactile micro-interaction.",
    ],
  },
  {
    version: "v0.1.1",
    changes: [
      "Create and edit organizations from dedicated routes.",
      "Create and edit teams within an organization.",
      "Collapsible sidebar navigation with persisted open/closed state.",
      "Theme toggle moved into the user menu.",
      "Refreshed organization selector and cleaned up unused layout components.",
    ],
  },
  {
    version: "v0.1.0",
    badge: "Initial release",
    summary:
      "First public version: authentication, multi-tenant organizations and teams, user settings, and the core app shell.",
  },
];
