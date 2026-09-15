import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { RegisterScreen } from "#/features/auth/components/register-screen";
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

  return <RegisterScreen invitation={invitation} />;
}
