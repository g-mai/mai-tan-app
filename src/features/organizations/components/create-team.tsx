import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  type CreatedTeam,
  useCreateTeam,
} from "#/features/organizations/hooks/useCreateTeam";

// TODO: add preselected organization for dropdown
export function CreateTeam({
  organizations,
  onCreated,
}: {
  organizations: { id: string; name: string }[];
  onCreated?: (team: CreatedTeam) => void;
}) {
  const { form, isPending } = useCreateTeam({
    defaultOrganizationId:
      organizations.length === 1 ? organizations[0].id : undefined,
    onCreated,
  });

  // TODO: Fix card description to also work during onboarding
  return (
    <Card>
      <CardHeader>
        <CardTitle>Name your team</CardTitle>
        <CardDescription>
          You can add a logo and more details in the next step.
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
          <form.AppField name="name">
            {(field) => (
              <field.TextField label="Name" placeholder="Design team" />
            )}
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
            <form.SubscribeButton
              label={isPending ? "Creating..." : "Continue"}
            />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
