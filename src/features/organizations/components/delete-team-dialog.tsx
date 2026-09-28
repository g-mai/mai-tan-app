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
import type { useDeleteTeam } from "#/features/organizations/hooks/useDeleteTeam";

export function DeleteTeamDialog({
  action,
  teamName,
}: {
  action: ReturnType<typeof useDeleteTeam>;
  teamName: string;
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
          <AlertDialogTitle>Delete {teamName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the team and removes its team memberships.
            Members will remain in the organization, which must keep at least
            one team.
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
            variant="destructive"
            disabled={action.isPending}
            onClick={action.submit}
          >
            {action.isPending ? "Deleting…" : "Delete team"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
