import type { auth } from "#/lib/better-auth/auth";

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
export type SessionData = Session["session"];

export type Organization = typeof auth.$Infer.Organization;
