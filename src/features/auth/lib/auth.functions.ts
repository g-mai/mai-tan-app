import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { auth } from "#/features/auth/lib/auth";
import type { Session } from "#/features/auth/types";
import { sendNotificationToAdmin } from "#/lib/resend/emails";

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

const setInitialPasswordSchema = z.object({
  password: z.string().min(8),
});

/**
 * Sets the password for a user created by the email-OTP flow. `setPassword` is
 * server-only and throws if a credential account already exists.
 */
export const setInitialPassword = createServerFn({ method: "POST" })
  .validator(setInitialPasswordSchema)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    await auth.api.setPassword({
      headers,
      body: { newPassword: data.password },
    });
  });

export const getAllSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const sessions = await auth.api.listSessions({ headers });
    return sessions;
  },
);

/**
 * Notifies the admin that a user finished email verification. Runs on the
 * server so the Resend client and its API key stay out of the browser bundle,
 * and reads the email from the session rather than the caller so the endpoint
 * can't be used to spam the admin. A failed notification must not break signup.
 */
export const notifyAdminOfNewUser = createServerFn({ method: "POST" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return;

    try {
      await sendNotificationToAdmin({
        subject: "New user registered",
        message: `A new user has registered with the email: ${session.user.email}`,
      });
    } catch (error) {
      console.error("Failed to notify admin of new user:", error);
    }
  },
);
