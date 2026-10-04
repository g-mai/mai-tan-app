import { useState } from "react";
import { DangerAreaCard } from "#/components/shared/danger-area-card";
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
import { useDeleteAccount } from "#/features/auth/hooks/useDeleteAccount";
import type { SoleOwnedOrg } from "#/features/organizations/lib/org";

function OrgWarning({ orgs }: { orgs: SoleOwnedOrg[] }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-left text-sm">
      <p className="font-medium">
        {orgs.length === 1
          ? `You're the only owner of ${orgs[0].name}.`
          : `You're the only owner of ${orgs.length} organizations.`}
      </p>
      <ul className="mt-2 grid gap-1 text-muted-foreground">
        {orgs.map((org) => (
          <li key={org.id}>
            <strong>{org.name}</strong> will be deleted, with its teams and
            invitations
            {org.otherMemberCount > 0 &&
              ` — and its ${org.otherMemberCount} other ${
                org.otherMemberCount === 1 ? "member" : "members"
              } will lose access`}
            .
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DeleteAccountSection({
  soleOwnedOrgs,
}: {
  soleOwnedOrgs: SoleOwnedOrg[];
}) {
  const [open, setOpen] = useState(false);
  const { form, isPending } = useDeleteAccount();

  return (
    <>
      <DangerAreaCard
        description="Permanently deletes your profile, your sessions and your organization memberships. This cannot be undone."
        buttonLabel="Delete my account"
        disabled={isPending}
        onClick={() => setOpen(true)}
      />

      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen || !isPending) setOpen(nextOpen);
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(event) => {
            if (isPending) event.preventDefault();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This is permanent. Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {soleOwnedOrgs.length > 0 && <OrgWarning orgs={soleOwnedOrgs} />}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="grid gap-4"
          >
            <form.AppField name="password">
              {(field) => (
                <field.PasswordField label="Password" placeholder="***" />
              )}
            </form.AppField>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isPending}>
                Cancel
              </AlertDialogCancel>
              {/* Not AlertDialogAction: it closes the dialog on click, which
                  would dismiss it before the mutation resolves. */}
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Deleting..." : "Delete permanently"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
