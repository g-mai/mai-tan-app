import { createFileRoute, redirect } from "@tanstack/react-router";
import { memberSearchSchema } from "#/features/organizations/lib/member-management";

export const Route = createFileRoute("/_protected/teams/$teamId/members")({
  validateSearch: memberSearchSchema,
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/teams/$teamId",
      params,
      search,
      replace: true,
    });
  },
});
