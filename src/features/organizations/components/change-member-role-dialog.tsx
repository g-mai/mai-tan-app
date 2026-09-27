import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { FieldGroup } from "#/components/ui/field";
import { Separator } from "#/components/ui/separator";
import { MemberTargetList } from "#/features/organizations/components/member-target-list";
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
        className="max-h-[90dvh] gap-6 overflow-y-auto"
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
            <MemberTargetList members={[target]} />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                form.handleSubmit();
              }}
              className="flex flex-col gap-6"
            >
              <fieldset disabled={isPending}>
                <FieldGroup>
                  <form.AppField name="role">
                    {(field) => (
                      <field.SelectField
                        label="Organization role"
                        options={(hasRole(callerRole, "owner")
                          ? ["member", "admin", "owner"]
                          : ["member", "admin"]
                        ).map((value) => ({
                          value,
                          label: value.charAt(0).toUpperCase() + value.slice(1),
                        }))}
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </fieldset>
              {action.error && (
                <p role="alert" className="text-sm text-destructive">
                  {action.error}
                </p>
              )}
              <Separator />
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
