import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import z from "zod";
import {
  ScreenBody,
  ScreenCard,
  ScreenFooter,
  ScreenHeader,
  ScreenStrip,
} from "#/components/shared/screen-shell";
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
    <ScreenCard>
      <ScreenStrip
        path="/register"
        state={invited ? "invited" : "1 / 2"}
        tone={invited ? "secondary" : "muted"}
      />
      <ScreenBody>
        <ScreenHeader
          title={
            invited ? `Join ${invited.organizationName}` : "Create an account"
          }
          description={
            invited
              ? `${invited.inviterName} invited you. Confirm your email with a 6-digit code and you'll join right after.`
              : "Enter your email and we'll send you a 6-digit code to confirm it."
          }
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-6 grid gap-4"
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

        {/* Same disclaimer, now a quiet note instead of loose grey text. */}
        <div className="mt-5 flex gap-2.5 rounded-lg border bg-muted p-3">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
            We only use your email for account and transactional messages —
            never marketing. You can permanently delete your account and all its
            data from Settings at any time.
          </p>
        </div>
      </ScreenBody>
      <ScreenFooter>
        <span>Already have an account?</span>
        <Link to="/login" className="text-primary underline underline-offset-4">
          Log in
        </Link>
      </ScreenFooter>
    </ScreenCard>
  );
}
