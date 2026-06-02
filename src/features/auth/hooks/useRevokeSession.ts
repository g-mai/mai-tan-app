import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { revokeSession } from "../lib/auth-client";

// import { revokeSessionAction } from "../lib/auth.functions";

export function useRevokeSession(): {
  revokeSession: (token: string) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
} {
  const router = useRouter();
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (token: string) => {
      if (!token) throw new Error("Token is required to revoke session");
      const { data, error } = await revokeSession({
        token,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Session revoked successfully.", {
        duration: 8000,
        position: "top-center",
      });
    },
    onError: (error) => {
      console.log("Error revoking session:", error);
      toast.error(error.message, {
        duration: 5000,
        position: "top-center",
      });
    },
    onSettled: async () => {
      // refreshes session data in router
      await router.invalidate();
    },
  });

  return {
    revokeSession: mutate,
    isPending,
    isSuccess,
    isError,
  };
}
