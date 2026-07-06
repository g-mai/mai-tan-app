import { Button } from "#/components/ui/button";
import { useDemo } from "#/features/demo/hooks/useDemo";

export function DemoButton() {
  const { start, isPending } = useDemo();

  return (
    <Button
      type="button"
      variant="default"
      className="w-full"
      disabled={isPending}
      onClick={() => start()}
    >
      {isPending ? "Setting up your demo…" : "Explore the demo"}
    </Button>
  );
}
