import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  type SentInvitation,
  useInviteMember,
} from "#/features/organizations/hooks/useInviteMember";

export function InviteMember({
  organizationId,
  onInvited,
}: {
  organizationId: string;
  onInvited?: (invitation: SentInvitation) => void;
}) {
  const { form, isPending } = useInviteMember({ organizationId, onInvited });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite someone</CardTitle>
        <CardDescription>
          They'll get an email with a link to join. It expires in 48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="Email" placeholder="teammate@email.com" />
            )}
          </form.AppField>
          <form.AppField name="role">
            {(field) => (
              <field.SelectField
                label="Role"
                placeholder="Select a role"
                description="Admins can manage teams and invite people."
                options={[
                  { value: "member", label: "Member" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Sending..." : "Send invitation"}
            />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
