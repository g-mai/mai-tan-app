import { SectionPanel } from "#/components/shared/screen-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import {
  type SentInvitation,
  useInviteMember,
} from "#/features/organizations/hooks/useInviteMember";
import { cn } from "#/lib/utils";

export function InviteMember({
  organizationId,
  onInvited,
  variant = "card",
}: {
  organizationId: string;
  onInvited?: (invitation: SentInvitation) => void;
  variant?: "card" | "panel";
}) {
  const { form, isPending } = useInviteMember({ organizationId, onInvited });

  const isPanel = variant === "panel";

  const body = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      {/* In a panel the two fields share a row; stacked everywhere else. */}
      <FieldGroup className={cn("gap-4", isPanel && "sm:flex-row")}>
        <div className={isPanel ? "sm:flex-2" : undefined}>
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="Email" placeholder="teammate@email.com" />
            )}
          </form.AppField>
        </div>
        <div className={isPanel ? "sm:flex-1" : undefined}>
          <form.AppField name="role">
            {(field) => (
              <field.SelectField
                label="Role"
                placeholder="Select a role"
                options={[
                  { value: "member", label: "Member" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            )}
          </form.AppField>
        </div>
      </FieldGroup>
      <form.AppForm>
        <form.SubscribeButton
          label={isPending ? "Sending..." : "Send invitation"}
        />
      </form.AppForm>
    </form>
  );

  if (!isPanel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invite a member</CardTitle>
          <CardDescription>
            Send an email invitation to join your organization. Invitations
            expire after 48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>{body}</CardContent>
      </Card>
    );
  }

  return (
    <SectionPanel
      title="Invite someone"
      description="They'll get an email with a link to join. It expires in 48 hours."
      variant={variant}
    >
      {body}
    </SectionPanel>
  );
}
