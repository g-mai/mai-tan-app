import { SectionPanel } from "#/components/shared/screen-shell";
import {
  type CreatedOrganization,
  useCreateOrg,
} from "#/features/organizations/hooks/useCreateOrg";
import { slugify } from "#/lib/utils";

const SLUG_PREFIX = import.meta.env.VITE_APP_URL
  ? `${import.meta.env.VITE_APP_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}/`
  : undefined;

export function CreateOrg({
  onCreated,
  variant = "card",
}: {
  onCreated: (org: CreatedOrganization) => void;
  variant?: "card" | "panel";
}) {
  const { form, isPending } = useCreateOrg({ onCreated });

  const body = (
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
            prefix={SLUG_PREFIX}
            description="Lowercase letters, numbers and dashes only."
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
      title="Name your organization"
      description="You can add a logo and more details later."
      variant={variant}
    >
      {body}
    </SectionPanel>
  );
}
