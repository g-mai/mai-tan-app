import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { ImageUpload } from "#/components/shared/image-upload";
import { UserAvatar } from "#/features/auth/components/user-avatar";
import { updateUser } from "#/features/auth/lib/auth-client";
import { useAdvanceOnboarding } from "#/features/onboarding/hooks/useAdvanceOnboarding";
import { ensureOnboardingStep } from "#/features/onboarding/lib/onboarding";
import { useAppForm } from "#/hooks/use-app-form";

export const Route = createFileRoute("/onboarding/profile")({
  beforeLoad: ({ context }) => ensureOnboardingStep(context.user, "profile"),
  component: RouteComponent,
});

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const { advance, isPending } = useAdvanceOnboarding();

  const form = useAppForm({
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
    validators: { onSubmit: profileFormSchema },
    onSubmit: async ({ value }) => {
      advance({
        firstName: value.firstName,
        lastName: value.lastName,
        name: `${value.firstName} ${value.lastName}`,
        onboardingStep: "organization",
      });
    },
  });

  async function handleImageUpload(
    url: string | undefined,
    error: Error | null,
  ) {
    try {
      if (error) throw error;
      if (!url) throw new Error("No URL returned from upload");

      const { error: updateError } = await updateUser({ image: url });
      if (updateError) throw updateError;

      await router.invalidate();
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Failed to update user image:", error);
      toast.error("Failed to update your picture. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
    }
  }

  return (
    <div className="p-2">
      <h1 className="text-lg font-semibold leading-none tracking-tight">
        Tell us who you are
      </h1>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        Your name is what teammates see across organizations and teams. A
        picture is optional.
      </p>

      <div className="flex gap-6">
        <div className="flex min-w-35 flex-col items-center gap-4">
          <UserAvatar user={{ ...user }} height={120} width={120} />
          <ImageUpload
            currentImageUrl={user.image}
            prefix="avatars"
            entityId={user.id}
            onUploadComplete={handleImageUpload}
            buttonText="Add a picture"
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid flex-1 gap-4 content-start"
        >
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField label="First Name" placeholder="John" />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.TextField label="Last Name" placeholder="Smith" />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Saving..." : "Continue"}
            />
          </form.AppForm>
        </form>
      </div>
    </div>
  );
}
