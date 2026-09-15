import { defineConfig } from "drizzle-kit";
import { getRemoteD1Credentials } from "./src/lib/env.tooling";

const dbCredentials = getRemoteD1Credentials();

export default defineConfig({
  out: "./src/lib/db/drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  ...(dbCredentials && { driver: "d1-http", dbCredentials }),
});