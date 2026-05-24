import { eq } from "drizzle-orm";
import { auth } from "#/features/auth/lib/auth";
import { db } from "#/lib/db";
import {
  organization as organizationTable,
  teamMember as teamMemberTable,
  team as teamTable,
  user as userTable,
} from "#/lib/db/schema";
import { seedData } from "#/lib/db/seed-data";

const { users, organizations } = seedData;

// TODO: add users to teams and organizations

async function seed(dropAllTable = false) {
  if (dropAllTable) {
    await resetTables();
  }

  console.log("Seeding database...");
  try {
    process.env.SKIP_VERIFICATION_EMAIL = "true";

    const seededUsers = [];
    const seededOrgs = [];
    const seededTeams = [];

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

      const seededUser = { ...newUser.user, ...user };
      seededUsers.push(seededUser);
      console.log("Seeded user:", newUser.user.name);

      // verify user email
      await db
        .update(userTable)
        .set({
          emailVerified: true,
        })
        .where(eq(userTable.id, newUser.user.id));
    }
    const usersByName = new Map(seededUsers.map((u) => [u.firstName, u]));

    // Seed organizations and teams
    for (const org of organizations) {
      const owner = usersByName.get(org.owner) || seededUsers[0];
      const seededOrg = await auth.api.createOrganization({
        body: {
          name: org.name,
          slug: org.slug,
          userId: owner.id,
          address: org.address,
          country: org.country,
          description: org.description,
          postCode: org.postCode,
          website: org.website,
          phone: org.phone,
        },
      });

      if (!seededOrg) {
        throw new Error("Failed to seed organization");
      }
      seededOrgs.push(seededOrg);

      console.log("Seeded organization:", seededOrg.name);

      for (const name of org.users) {
        const user = usersByName.get(name) || seededUsers[0];
        await auth.api.addMember({
          body: {
            organizationId: seededOrg.id,
            userId: user.id,
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
        console.log("Seeded team:", seededTeam.name);
        for (const name of team.users) {
          const user = usersByName.get(name) || seededUsers[0];
          await db.insert(teamMemberTable).values({
            id: crypto.randomUUID(),
            teamId: seededTeam.id,
            userId: user.id,
            createdAt: new Date(),
          });
        }
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
