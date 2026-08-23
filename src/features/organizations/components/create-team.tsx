import { SectionPanel } from "#/components/shared/screen-shell";
import {
  type CreatedTeam,
  useCreateTeam,
} from "#/features/organizations/hooks/useCreateTeam";

// TODO: add preselected organization for dropdown
export function CreateTeam({
  organizations,
  onCreated,
  variant = "card",
}: {
  organizations: { id: string; name: string }[];
  onCreated?: (team: CreatedTeam) => void;
  variant?: "card" | "panel";
}) {
  const { form, isPending } = useCreateTeam({
    defaultOrganizationId:
      organizations.length === 1 ? organizations[0].id : undefined,
    onCreated,
  });

  const body = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-4"
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" placeholder="Design team" />}
      </form.AppField>
      <form.AppField name="organizationId">
        {(field) => (
          <field.SelectField
            label="Organization"
            placeholder="Select an organization"
            description="Only owners and admins can create teams."
            options={organizations.map((org) => ({
              value: org.id,
              label: org.name,
            }))}
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubscribeButton label={isPending ? "Creating..." : "Continue"} />
      </form.AppForm>
    </form>
  );

  return (
    <SectionPanel
      title="Name your team"
      description="You can add a logo and more details later."
      variant={variant}
    >
      {body}
    </SectionPanel>
  );
}
