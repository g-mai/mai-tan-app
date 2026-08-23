import { SectionPanel } from "#/components/shared/screen-shell";
import {
  type SentInvitation,
  useInviteMember,
} from "#/features/organizations/hooks/useInviteMember";

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
      className="grid gap-4"
    >
      {/* In a panel the two fields share a row; stacked everywhere else. */}
      <div
        className={isPanel ? "flex flex-col gap-3 sm:flex-row" : "grid gap-4"}
      >
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
      </div>
      <form.AppForm>
        <form.SubscribeButton
          label={isPending ? "Sending..." : "Send invitation"}
        />
      </form.AppForm>
    </form>
  );

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
