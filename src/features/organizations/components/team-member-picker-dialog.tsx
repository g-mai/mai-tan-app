import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Separator } from "#/components/ui/separator";
import {
  MemberPagination,
  MemberSearch,
} from "#/features/organizations/components/member-list-controls";
import { MemberResults } from "#/features/organizations/components/member-results";
import { MemberTable } from "#/features/organizations/components/member-table";
import type { useTeamMemberPicker } from "#/features/organizations/hooks/useTeamMemberPicker";

export function TeamMemberPickerDialog({
  picker,
  name,
  userId,
}: {
  picker: ReturnType<typeof useTeamMemberPicker>;
  name: string;
  userId: string;
}) {
  const { action } = picker;
  return (
    <Dialog
      open={picker.isOpen}
      onOpenChange={(open) => {
        if (!open) picker.close();
      }}
    >
      <DialogContent
        onCloseAutoFocus={picker.restoreFocus}
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={!action.isPending}
        onEscapeKeyDown={(event) => {
          if (action.isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (action.isPending) event.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 p-6 pr-10">
          <DialogTitle>Add members to {name}</DialogTitle>
          <DialogDescription>
            Choose existing organization members to add to this team.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="min-h-0 overflow-y-auto">
          <div className="p-5">
            <MemberSearch
              value={picker.input}
              onChange={picker.setInput}
              disabled={action.isPending}
              total={picker.members.total}
            />
          </div>
          <MemberTable
            rows={picker.members.rows}
            userId={userId}
            selection={picker.selection}
            disabled={action.isPending || picker.changing}
            emptyMessage={
              picker.input.trim()
                ? "No members match your search."
                : "Every organization member is already in this team."
            }
          />
          <div className="flex flex-col gap-4 p-5">
            <MemberPagination
              members={picker.members}
              onPage={picker.setPage}
              disabled={action.isPending || picker.changing}
            />
            <MemberResults
              failures={action.failures}
              onRetry={picker.retry}
              disabled={action.isPending || picker.changing}
              canRetry={picker.members.rows.some((row) =>
                action.failures.some(
                  (failure) => failure.userId === row.userId,
                ),
              )}
            />
          </div>
        </div>
        <Separator />
        <div className="flex shrink-0 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">
              {picker.selection.ids.length}
            </span>{" "}
            selected
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={action.isPending}
              onClick={picker.close}
            >
              Cancel
            </Button>
            <Button
              disabled={
                action.isPending ||
                picker.changing ||
                !picker.selection.ids.length
              }
              onClick={picker.submit}
            >
              {action.isPending ? "Adding…" : "Add members"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
