import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import {
  type InvitationPreview,
  toInvitationPreview,
} from "#/features/organizations/lib/invitation";
import { db } from "#/lib/db";

const getInvitationPreviewSchema = z.object({ id: z.string() });

/**
 * Public read for the /invite/$invitationId landing page.
 *
 * Better Auth's own `getInvitation` needs a session whose email already matches
 * the invitation, so it can only ever succeed for someone who needs no preview.
 * This reads the row directly instead — the invitation id is a 32-character
 * CSPRNG token emailed to one address, so holding it is the authorisation.
 *
 * `toInvitationPreview` decides what may be returned.
 */
export const getInvitationPreview = createServerFn({ method: "GET" })
  .validator(getInvitationPreviewSchema)
  .handler(async ({ data }): Promise<InvitationPreview> => {
    const invitation = await db.query.invitation.findFirst({
      where: (invitation, { eq }) => eq(invitation.id, data.id),
      with: {
        organization: { columns: { name: true } },
        user: { columns: { name: true, email: true } },
      },
    });

    return toInvitationPreview(invitation);
  });

const listOrgInvitationsSchema = z.object({
  organizationId: z.string().optional(),
});

/**
 * Every invitation for an organization — the caller must be a member. Returns
 * all statuses, so filter before displaying.
 */
export const listOrgInvitations = createServerFn({ method: "GET" })
  .validator(listOrgInvitationsSchema)
  .handler(async ({ data }) => {
    return auth.api.listInvitations({
      headers: getRequestHeaders(),
      query: { organizationId: data.organizationId },
    });
  });

/**
 * Pending invitations for the signed-in user's verified email address.
 *
 * Better Auth joins only the organization, so the inviter is read separately —
 * the dashboard shows who sent the invitation, not just where it leads.
 */
export const listMyInvitations = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) return [];

    const invitations = await auth.api.listUserInvitations({
      headers: getRequestHeaders(),
    });
    if (invitations.length === 0) return [];

    const rows = await db.query.invitation.findMany({
      where: (invitation, { inArray }) =>
        inArray(
          invitation.id,
          invitations.map((invitation) => invitation.id),
        ),
      columns: { id: true },
      with: { user: { columns: { name: true, email: true } } },
    });
    const inviters = new Map(rows.map((row) => [row.id, row.user]));

    return invitations.map((invitation) => ({
      ...invitation,
      inviterName: inviters.get(invitation.id)?.name ?? null,
      inviterEmail: inviters.get(invitation.id)?.email ?? null,
    }));
  },
);
