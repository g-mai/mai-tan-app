import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/better-auth/auth";

type Session = Awaited<ReturnType<typeof getSession>>;

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);
export function ensureSession(beforeLoadCtx: {
  context: { session: Session };
}) {
  const session = beforeLoadCtx.context.session;

  if (!session) {
    throw redirect({ to: "/login" });
  }

  return session;
}
