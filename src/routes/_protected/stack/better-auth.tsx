import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { TechStackPage } from "#/components/shared/tech-stack-page";

export const Route = createFileRoute("/_protected/stack/better-auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TechStackPage
      name="Better Auth"
      tagline="Comprehensive authentication framework for TypeScript"
      icon={ShieldCheck}
      overview="Better Auth bills itself as the most comprehensive authentication framework for TypeScript, supporting Next.js, TanStack Start, Nuxt, SvelteKit, and 20+ other frameworks. It includes built-in credential authentication, social sign-on providers, multi-tenancy with teams and roles, passkeys, magic links, and enterprise features like SSO and SAML."
      role="Handles authentication in this starter via the Drizzle adapter. The organizations plugin provides the multi-tenant model — organizations, teams, members, and roles — with sessions threaded through router context via a server-side getSession function."
      link="https://www.better-auth.com"
    />
  );
}
