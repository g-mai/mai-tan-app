import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { signIn } from "#/features/auth/lib/auth-client";
import { bootstrapDemo } from "#/features/demo/lib/demo.functions";

export function useDemo() {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await signIn.anonymous();
      if (error) throw error;
      await bootstrapDemo();
    },
    onSuccess: () => {
      // Hard navigation so SSR re-fetches the session with the guest's orgs
      // and active organization already populated.
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      console.error("Demo error:", error);
      toast.error(
        error.message || "Failed to start the demo. Please try again.",
        {
          duration: 5000,
          position: "top-center",
        },
      );
    },
  });

  return { start: mutate, isPending };
}
