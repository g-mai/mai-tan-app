import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { createFakeMember } from "#/features/organizations/lib/org.functions";

export function FakerMember({ organizationId }: { organizationId: string }) {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => createFakeMember({ data: { organizationId } }),
    onSuccess: async (member) => {
      await router.invalidate();
      toast.success(`${member.name} joined the organization.`, {
        duration: 5000,
        position: "top-center",
      });
    },
    onError: (error) => {
      console.error("Create fake member error:", error);
      toast.error(error.message || "Could not create a fake teammate.", {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  return (
    <Button variant="outline" disabled={isPending} onClick={() => mutate()}>
      {isPending ? "Adding..." : "Create a fake teammate"}
    </Button>
  );
}
