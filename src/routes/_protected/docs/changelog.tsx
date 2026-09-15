import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "#/components/shared/page-title";
import { ChangelogEntry } from "#/features/docs/components/changelog-entry";
import { CHANGELOG } from "#/features/docs/lib/changelog";

export const Route = createFileRoute("/_protected/docs/changelog")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Changelog" subtitle="Notable changes by version." />

      {CHANGELOG.map((entry) => (
        <ChangelogEntry key={entry.version} entry={entry} />
      ))}
    </div>
  );
}
