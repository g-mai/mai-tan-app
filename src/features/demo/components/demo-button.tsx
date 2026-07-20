import { Button } from "#/components/ui/button";
import { useDemo } from "#/features/demo/hooks/useDemo";
import { cn } from "#/lib/utils";

export function DemoButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { start, isPending } = useDemo();

  return (
    <Button
      type="button"
      variant="default"
      className={cn("w-full", className)}
      disabled={isPending}
      onClick={() => start()}
      {...props}
    >
      {isPending ? "Setting up your demo…" : (children ?? "Explore the App")}
    </Button>
  );
}
