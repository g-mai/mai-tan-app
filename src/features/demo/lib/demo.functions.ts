import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/features/auth/lib/auth";
import { generateDemoData } from "#/features/demo/lib/faker-data";
import { db } from "#/lib/db";
import { teamMember as teamMemberTable } from "#/lib/db/schema";
import { sendNotificationToAdmin } from "#/lib/resend/emails";

/**
 * Populates the app for the currently signed-in anonymous guest: creates 2
 * organizations (guest as owner) each with 10 faker members and 3 teams, then
 * makes the first org active.
 */
export const bootstrapDemo = createServerFn({ method: "POST" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user) {
      throw new Error("No active session — sign in as a guest first.");
    }
    const guestId = session.user.id;

    process.env.SKIP_VERIFICATION_EMAIL = "true";

    const organizations = generateDemoData();

    for (const org of organizations) {
      // Create the org's faker members.
      const memberIds: string[] = [];
      for (const user of org.users) {
        const newUser = await auth.api.signUpEmail({
          body: {
            email: user.email,
            password: user.password,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });
        if (!newUser.user) throw new Error("Failed to create demo user");
        memberIds.push(newUser.user.id);
      }

      const seededOrg = await auth.api.createOrganization({
        body: {
          name: org.name,
          slug: org.slug,
          userId: guestId,
          description: org.description,
          website: org.website,
          address: org.address,
          postCode: org.postCode,
          country: org.country,
          phone: org.phone,
        },
      });
      if (!seededOrg) throw new Error("Failed to create demo organization");

      for (const userId of memberIds) {
        await auth.api.addMember({
          body: {
            organizationId: seededOrg.id,
            userId,
            role: "member",
          },
        });
      }

      for (const team of org.teams) {
        const seededTeam = await auth.api.createTeam({
          body: {
            name: team.name,
            organizationId: seededOrg.id,
            description: team.description,
          },
        });
        for (const index of team.memberIndexes) {
          await db.insert(teamMemberTable).values({
            id: crypto.randomUUID(),
            teamId: seededTeam.id,
            userId: memberIds[index],
            createdAt: new Date(),
          });
        }
      }

      // Make the first org the active one.
      if (org === organizations[0]) {
        await auth.api.setActiveOrganization({
          headers,
          body: { organizationId: seededOrg.id },
        });
      }
    }

    await sendNotificationToAdmin({
      subject: "Demo account created",
      message: `A demo account has been created for guest user with ID: ${guestId}`,
    });
  },
);
