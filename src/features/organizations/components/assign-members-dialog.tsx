import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { MemberResults } from "#/features/organizations/components/member-results";
import type { useAddTeamMembers } from "#/features/organizations/hooks/useAddTeamMembers";

export function AssignMembersDialog({
  action,
  teams,
}: {
  action: ReturnType<typeof useAddTeamMembers>;
  teams: { id: string; name: string }[];
}) {
  const { targets, form, isPending } = action;
  return (
    <Dialog
      open={targets.length > 0}
      onOpenChange={(open) => {
        if (!open) action.close();
      }}
    >
      <DialogContent
        onCloseAutoFocus={action.restoreFocus}
        showCloseButton={!isPending}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add to team</DialogTitle>
          <DialogDescription>
            {targets.length} selected member(s). Existing memberships in other
            teams are preserved.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-32 overflow-y-auto text-sm">
          {targets.map((row) => (
            <li key={row.userId} className="break-all">
              {row.name} ({row.email})
            </li>
          ))}
        </ul>
        {teams.length ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
            className="grid gap-4"
          >
            <fieldset disabled={isPending}>
              <form.AppField name="teamId">
                {(field) => (
                  <field.SelectField
                    label="Target team"
                    placeholder="Choose a team"
                    options={teams.map((team) => ({
                      value: team.id,
                      label: team.name,
                    }))}
                  />
                )}
              </form.AppField>
            </fieldset>
            <MemberResults
              failures={action.failures}
              disabled={isPending}
              canRetry={action.canSubmit}
              onRetry={() => form.handleSubmit()}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={action.close}
              >
                Cancel
              </Button>
              <form.Subscribe selector={(state) => state.values.teamId}>
                {(teamId) => (
                  <Button
                    type="submit"
                    disabled={isPending || !teamId || !action.canSubmit}
                  >
                    {isPending ? "Adding…" : "Add to team"}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        ) : (
          <>
            <p>Create a team before adding members.</p>
            <Button asChild>
              <Link to="/teams/new">Create a team</Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
