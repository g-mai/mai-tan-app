import { useRouter } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { Button } from "#/components/ui/button";

export function RouteError({
  title,
  message,
  error,
  retry = false,
}: {
  title: string;
  message: string;
  error: unknown;
  retry?: boolean;
}) {
  const router = useRouter();
  return (
    <div>
      <PageTitle title={title} />
      <p className="text-sm text-muted-foreground">{message}</p>
      {error instanceof Error && (
        <p className="text-sm text-muted-foreground">{error.message}</p>
      )}
      {retry && (
        <Button className="mt-4" onClick={() => router.invalidate()}>
          Retry
        </Button>
      )}
    </div>
  );
}
