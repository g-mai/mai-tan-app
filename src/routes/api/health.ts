import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { db } from "#/lib/db";

/**
 * Warm-up target for the scheduled ping. Serverless holds the SSR function and
 * the database in separate idle states, so the ping has to touch both: the
 * request itself keeps the function instance alive, and `select 1` keeps the
 * database from suspending. `no-store` matters — a cached response would never
 * reach the origin and would warm nothing.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        await db.execute(sql`select 1`);

        return Response.json(
          { ok: true },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
