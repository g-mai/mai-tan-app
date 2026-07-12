import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  type CreatedOrganization,
  useCreateOrg,
} from "#/features/organizations/hooks/useCreateOrg";
import { slugify } from "#/lib/utils";

export function CreateOrg({
  onCreated,
}: {
  onCreated: (org: CreatedOrganization) => void;
}) {
  const { form, isPending } = useCreateOrg({ onCreated });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name your organization</CardTitle>
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
          <form.AppField
            name="name"
            listeners={{
              onChange: ({ value }) => {
                // Keep the slug in sync with the name until the user edits it themselves.
                if (!form.getFieldMeta("slug")?.isDirty) {
                  form.setFieldValue("slug", slugify(value), {
                    dontUpdateMeta: true,
                  });
                }
              },
            }}
          >
            {(field) => <field.TextField label="Name" placeholder="Acme Inc" />}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => (
              <field.TextField
                label="Slug"
                placeholder="acme-inc"
                description="Lowercase letters, numbers and dashes only."
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
