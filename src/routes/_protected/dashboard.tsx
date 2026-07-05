import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Building2, Settings2, Users } from "lucide-react";
import { PageTitle } from "#/components/shared/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

const quickLinks = [
  {
    title: "Organizations",
    description: "View and manage the organizations you belong to.",
    href: "/organizations",
    icon: Building2,
  },
  {
    title: "Teams",
    description: "See the teams you're a part of across your organizations.",
    href: "/teams",
    icon: Users,
  },
  {
    title: "Settings",
    description: "Update your profile, email, password, and sessions.",
    href: "/settings",
    icon: Settings2,
  },
] as const;

function RouteComponent() {
  const { user, orgs } = Route.useRouteContext();
  const orgCount = orgs.length;

  return (
    <div>
      <PageTitle
        title={`Welcome back, ${user.firstName || user.name}`}
        subtitle={
          orgCount > 0
            ? `You're a member of ${orgCount} organization${orgCount === 1 ? "" : "s"}.`
            : "You're not part of any organization yet."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(({ title, description, href, icon: Icon }) => (
          <Link to={href} key={title}>
            <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-4" />
            Built on
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TanStack Start, Better Auth, Drizzle ORM, and shadcn/ui. See{" "}
            <Link to="/about" className="underline underline-offset-4">
              About
            </Link>{" "}
            for more on this starter kit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
