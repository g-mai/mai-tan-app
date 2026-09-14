import { PageTitle } from "#/components/shared/page-title";

export function RouteError({
  title,
  message,
  error,
}: {
  title: string;
  message: string;
  error: unknown;
}) {
  return (
    <div>
      <PageTitle title={title} />
      <p className="text-sm text-muted-foreground">{message}</p>
      {error instanceof Error && (
        <p className="text-sm text-muted-foreground">{error.message}</p>
      )}
    </div>
  );
}
