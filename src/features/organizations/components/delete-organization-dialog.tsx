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
import type { useDeleteOrganization } from "#/features/organizations/hooks/useDeleteOrganization";

export function DeleteOrganizationDialog({
  action,
  organizationName,
}: {
  action: ReturnType<typeof useDeleteOrganization>;
  organizationName: string;
}) {
  return (
    <AlertDialog
      open={action.isOpen}
      onOpenChange={(open) => {
        if (!open) action.close();
      }}
    >
      <AlertDialogContent
        onCloseAutoFocus={action.restoreFocus}
        onEscapeKeyDown={(event) => {
          if (action.isPending) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {organizationName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the organization, its teams, members, and
            invitations. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {action.error && (
          <p role="alert" className="text-sm text-destructive">
            {action.error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={action.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={action.isPending}
            onClick={action.submit}
          >
            {action.isPending ? "Deleting…" : "Delete organization"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
