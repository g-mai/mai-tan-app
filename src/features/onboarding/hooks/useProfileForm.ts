import z from "zod";
import { useOnboardingNavigation } from "#/features/onboarding/hooks/useOnboardingNavigation";
import { useAppForm } from "#/hooks/use-app-form";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

/** Name is persisted as part of advancing the step, not as a separate write. */
export function useProfileForm(user: {
  firstName?: string | null;
  lastName?: string | null;
}) {
  const { navigate, isPending } = useOnboardingNavigation();

  const form = useAppForm({
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
    validators: { onSubmit: profileFormSchema },
    onSubmit: async ({ value }) => {
      navigate({
        firstName: value.firstName,
        lastName: value.lastName,
        name: `${value.firstName} ${value.lastName}`,
        onboardingStep: "organization",
      });
    },
  });

  return { form, isPending };
}
