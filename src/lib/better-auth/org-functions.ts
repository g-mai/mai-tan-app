import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/better-auth/auth";

export const listOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const orgs = await auth.api.listOrganizations({ headers });
    return orgs;
  },
);
