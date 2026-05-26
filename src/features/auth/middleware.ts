import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/features/auth/lib/auth";

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user) {
      console.warn("Unauthorized access attempt. Redirecting to login.");
      throw new Error("Unauthorized");
    }
    return next({ context: { session } });
  },
);
