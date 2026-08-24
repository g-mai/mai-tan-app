import { inArray, lt } from "drizzle-orm";
import {
  ABANDONED_AFTER_MS,
  isAbandonedRegistration,
} from "#/features/auth/lib/abandoned-registration";
import { db } from "#/lib/db";
import { user as userTable } from "#/lib/db/schema";

/**
 * Deletes users who verified their email during registration and then stopped
 * before setting a password. Sessions and accounts cascade on user.id.
 *
 * Run it on a schedule — see docs/dev/maintenance.md.
 */
async function purgeAbandoned(dryRun = false) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - ABANDONED_AFTER_MS);

  const candidates = await db.query.user.findMany({
    where: lt(userTable.createdAt, cutoff),
    columns: { id: true, email: true, createdAt: true },
    with: {
      accounts: { columns: { providerId: true } },
      members: { columns: { id: true } },
    },
  });

  const abandoned = candidates.filter((user) =>
    isAbandonedRegistration(user, now),
  );

  console.log(
    `Checked ${candidates.length} user(s) created before ${cutoff.toISOString()}.`,
  );

  if (abandoned.length === 0) {
    console.log("No abandoned registrations to remove.");
    return;
  }

  for (const user of abandoned) {
    console.log(
      `${dryRun ? "Would delete" : "Deleting"}: ${user.email} (created ${user.createdAt.toISOString()})`,
    );
  }

  if (dryRun) {
    console.log(`Dry run — ${abandoned.length} user(s) left untouched.`);
    return;
  }

  await db.delete(userTable).where(
    inArray(
      userTable.id,
      abandoned.map((user) => user.id),
    ),
  );
  console.log(`Deleted ${abandoned.length} abandoned registration(s).`);
}

const dryRun = process.argv.includes("--dry-run");

try {
  await purgeAbandoned(dryRun);
} catch (error) {
  console.error("Error purging abandoned registrations:", error);
  process.exitCode = 1;
} finally {
  // Cron invocations must not hang on the connection pool.
  await db.$client.end();
}
