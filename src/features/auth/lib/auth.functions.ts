import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/features/auth/lib/auth";
import type { Session } from "#/features/auth/types";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);

export function ensureSession(beforeLoadCtx: {
  context: { session: Session | null };
}) {
  const session = beforeLoadCtx.context.session;

  if (!session) {
    throw redirect({ to: "/login" });
  }

  return session;
}

export const getAllSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const sessions = await auth.api.listSessions({ headers });
    return sessions;
  },
);
