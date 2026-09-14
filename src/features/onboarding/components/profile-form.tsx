import { useProfileForm } from "#/features/onboarding/hooks/useProfileForm";

export function ProfileForm({
  user,
}: {
  user: { firstName?: string | null; lastName?: string | null };
}) {
  const { form, isPending } = useProfileForm(user);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid flex-1 content-start gap-4"
    >
      <form.AppField name="firstName">
        {(field) => <field.TextField label="First Name" placeholder="John" />}
      </form.AppField>
      <form.AppField name="lastName">
        {(field) => <field.TextField label="Last Name" placeholder="Smith" />}
      </form.AppField>
      <form.AppForm>
        <form.SubscribeButton label={isPending ? "Saving..." : "Continue"} />
      </form.AppForm>
    </form>
  );
}
