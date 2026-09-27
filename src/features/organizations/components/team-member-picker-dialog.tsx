import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
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
        className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
        showCloseButton={!action.isPending}
        onEscapeKeyDown={(event) => {
          if (action.isPending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (action.isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add members to {name}</DialogTitle>
          <DialogDescription>
            Choose existing organization members to add to this team.
          </DialogDescription>
        </DialogHeader>
        <MemberSearch
          value={picker.input}
          onChange={picker.setInput}
          disabled={action.isPending}
          total={picker.members.total}
        />
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
            action.failures.some((failure) => failure.userId === row.userId),
          )}
        />
        <DialogFooter>
          <p className="mr-auto text-sm">
            {picker.selection.ids.length} selected
          </p>
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
      </DialogContent>
    </Dialog>
  );
}
