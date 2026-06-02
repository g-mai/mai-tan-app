import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "#/lib/env";
import { schema } from "./schema";

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
    // ssl: false
  },
  schema,
});
