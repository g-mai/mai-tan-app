import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "drizzle-kit";

function findLocalD1Sqlite() {
  const dir = join(
    ".wrangler",
    "state",
    "v3",
    "d1",
    "miniflare-D1DatabaseObject",
  );

  if (!existsSync(dir)) {
    throw new Error(
      `${dir} not found. Run "pnpm dev" at least once to create the local D1 database.`,
    );
  }

  const sqliteFile = readdirSync(dir).find((file) => file.endsWith(".sqlite"));

  if (!sqliteFile) {
    throw new Error(
      `No .sqlite file found in ${dir}. Run "pnpm dev" at least once to create the local D1 database.`,
    );
  }

  return join(dir, sqliteFile);
}

export default defineConfig({
  out: "./src/lib/db/drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: findLocalD1Sqlite(),
  },
});
