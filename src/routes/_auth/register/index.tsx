import { createFileRoute, Link } from "@tanstack/react-router";
import z from "zod";
import { useRegisterEmail } from "#/features/auth/hooks/useRegisterEmail";
import { getInvitationPreview } from "#/features/organizations/lib/invitation.functions";

export const Route = createFileRoute("/_auth/register/")({
  // Cosmetic only: the invitation is picked up from the user's pending
  // invitations at the organization step, so losing this param costs a
  // prefilled field and nothing more.
  validateSearch: z.object({
    invitation: z.string().optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ invitation: search.invitation }),
  loader: async ({ deps }) =>
    deps.invitation
      ? getInvitationPreview({ data: { id: deps.invitation } })
      : null,
  component: RouteComponent,
});

function RouteComponent() {
  const invitation = Route.useLoaderData();
  const invited = invitation?.status === "pending" ? invitation : null;
  const { form, isPending } = useRegisterEmail({
    defaultEmail: invited?.email,
  });

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          {invited ? `Join ${invited.organizationName}` : "Create an account"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          {invited
            ? `${invited.inviterName} invited you. Confirm your email with a 6-digit code and you'll join right after.`
            : "Enter your email and we'll send you a 6-digit code to confirm it."}
        </p>

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
              <field.TextField label="Email" placeholder="john@email.com" />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton
              label={isPending ? "Sending code..." : "Send code"}
            />
          </form.AppForm>
        </form>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
          We only use your email for account and transactional messages — never
          marketing. You can permanently delete your account and all its data
          from Settings at any time.
        </p>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-sm text-primary-500 dark:text-primary-400 underline hover:text-primary"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
