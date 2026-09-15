import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export const db = drizzle(env.DB, { schema });
