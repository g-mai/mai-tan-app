import { eq } from "drizzle-orm";
import { db } from "#/db";
import {
  organization as organizationTable,
  team as teamTable,
  user as userTable,
} from "#/db/schema";
import { seedConfig } from "#/db/seed-config";
import { auth } from "#/lib/auth";

const { users, organizations } = seedConfig;

// TODO: add users to teams and organizations

async function seed(dropAllTable = false) {
  if (dropAllTable) {
    await resetTables();
  }

  console.log("Seeding database...");
  try {
    process.env.SKIP_VERIFICATION_EMAIL = "true";

    const seededUsers = [];

    // Seed users
    for (const user of users) {
      const newUser = await auth.api.signUpEmail({
        body: {
          email: user.email,
          password: user.password,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      if (!newUser.user) {
        throw new Error("Failed to seed user");
      }

      seededUsers.push(newUser.user);

      console.log("Seeded user:", newUser.user.name);

      // verify user email
      await db
        .update(userTable)
        .set({
          emailVerified: true,
        })
        .where(eq(userTable.id, newUser.user.id));
    }

    // Seed organizations and teams
    for (const org of organizations) {
      const index = organizations.indexOf(org);
      const owner = seededUsers[index] || seededUsers[0];
      const seededOrg = await auth.api.createOrganization({
        body: {
          name: org.name,
          slug: org.slug,
          userId: owner.id,
        },
      });

      if (!seededOrg) {
        throw new Error("Failed to seed organization");
      }

      console.log("Seeded organization:", seededOrg.name);

      for (const team of org.teams) {
        const seededTeam = await auth.api.createTeam({
          body: {
            name: team.name,
            organizationId: seededOrg?.id,
          },
        });

        console.log("Seeded team:", seededTeam.name);
      }
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function resetTables() {
  if (process.env.NODE_ENV === "production") return;

  console.log("Resetting database tables...");
  // Cascading rules should handle dependent deletions
  await db.delete(userTable);
  await db.delete(organizationTable);
  await db.delete(teamTable);
  console.log("Database tables reset.");
}

// Check for --drop flag in command line arguments
const shouldDrop = process.argv.includes("--reset");
seed(shouldDrop);
