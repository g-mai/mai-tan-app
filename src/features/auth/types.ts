import type { auth } from "#/features/auth/lib/auth";

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
export type SessionData = Session["session"];

export type Organization = Session["orgs"][number];
