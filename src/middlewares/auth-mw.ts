import { useRouter } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getSession } from "@/lib/better-auth/auth-functions";

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const router = useRouter();
    const session = await getSession();
    if (!session?.user) {
      // throw new Error("Unauthorized");
      console.warn("Unauthorized access attempt. Redirecting to login.");
      router.navigate({ to: "/login" });
    }
    return next({ context: { session } });
  },
);
