import { useRouter } from "@tanstack/react-router";
import { Loader2Icon, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success("You have been logged out successfully.");
      router.navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline" disabled={loading}>
      {loading ? <Loader2Icon className="animate-spin" /> : <LogOut />}
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
