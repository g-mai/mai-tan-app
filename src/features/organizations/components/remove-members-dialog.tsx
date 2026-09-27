import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { MemberTargetList } from "#/features/organizations/components/member-target-list";
import type { MemberRow } from "#/features/organizations/lib/member-management";

export function RemoveMembersDialog({
  targets,
  scopeName,
  organization = false,
  excluded = 0,
  isPending,
  onClose,
  onSubmit,
  restoreFocus,
}: {
  targets: MemberRow[];
  scopeName: string;
  organization?: boolean;
  excluded?: number;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
  restoreFocus: (event: Event) => void;
}) {
  return (
    <AlertDialog
      open={targets.length > 0}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <AlertDialogContent
        className="max-h-[90dvh] gap-6 overflow-y-auto"
        onCloseAutoFocus={restoreFocus}
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove{" "}
            {targets.length === 1
              ? targets[0].name || targets[0].email
              : `${targets.length} members`}{" "}
            from {scopeName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {organization
              ? "Removing these members also removes them from this organization’s teams."
              : "These people will remain members of the organization."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <MemberTargetList members={targets} />
        {excluded > 0 && (
          <p className="text-sm text-muted-foreground">
            {excluded} selected owner{excluded === 1 ? " is" : "s are"} excluded
            because only owners can remove owners.
          </p>
        )}
        <Separator />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={isPending} onClick={onSubmit}>
            {isPending ? "Removing…" : "Remove members"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
