import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import type { useUpdateMemberRole } from "#/features/organizations/hooks/useUpdateMemberRole";
import { hasRole } from "#/features/organizations/lib/org";

export function ChangeMemberRoleDialog({
  action,
  callerRole,
}: {
  action: ReturnType<typeof useUpdateMemberRole>;
  callerRole: string;
}) {
  const { target, form, isPending } = action;
  return (
    <Dialog
      open={!!target}
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
          <DialogTitle>Change organization role</DialogTitle>
          <DialogDescription>
            An organization role affects permissions throughout this
            organization, including its teams.
          </DialogDescription>
        </DialogHeader>
        {target && (
          <>
            <p className="break-all text-sm">
              {target.name} ({target.email}) · Current role: {target.role}
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                form.handleSubmit();
              }}
              className="grid gap-4"
            >
              <fieldset disabled={isPending}>
                <form.AppField name="role">
                  {(field) => (
                    <field.SelectField
                      label="Organization role"
                      options={(hasRole(callerRole, "owner")
                        ? ["member", "admin", "owner"]
                        : ["member", "admin"]
                      ).map((value) => ({ value, label: value }))}
                    />
                  )}
                </form.AppField>
              </fieldset>
              {action.error && (
                <p role="alert" className="text-sm text-destructive">
                  {action.error}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={action.close}
                >
                  Cancel
                </Button>
                <form.Subscribe selector={(state) => state.values.role}>
                  {(role) => (
                    <Button
                      type="submit"
                      disabled={isPending || role === target.role}
                    >
                      {isPending ? "Changing…" : "Change role"}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
