import { FileCheck, Layers3, LockKeyhole, Mail, Route } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";
import { cn } from "#/lib/utils";

const capabilities = [
  {
    title: "Authentication and sessions",
    description:
      "Email OTP registration, password setup, login, verification, and session-aware routing.",
    icon: LockKeyhole,
  },
  {
    title: "Guided onboarding",
    description:
      "A mandatory, resumable flow for profile, organization, team, and invitation setup.",
    icon: Route,
  },
  {
    title: "Transactional email flows",
    description:
      "Verification and password-reset messages are ready to run through Resend.",
    icon: Mail,
  },
  {
    title: "Typed full-stack patterns",
    description:
      "TanStack Forms, Zod, server functions, and query mutations fit together end to end.",
    icon: FileCheck,
  },
];

export function HomeFeatures() {
  return (
    <section id="features" className="scroll-mt-15 border-b bg-muted/50">
      <div className="mx-auto max-w-300 px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-160">
          <div className="font-mono text-xs text-muted-foreground">
            {"// what is already here"}
          </div>
          <h2 className="mt-3.5 font-bold text-3xl leading-[1.1] tracking-tight sm:text-[34px]">
            A multi-tenant core you can build on.
          </h2>
          <p className="mt-3.5 max-w-[60ch] text-[15px] text-muted-foreground leading-relaxed">
            The important flows are visible in the app and organized around
            patterns you can carry into your own product.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <Card className="h-fit shadow-md">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Layers3 aria-hidden="true" className="size-5" />
              </div>
              <CardTitle className="text-xl">Organizations and teams</CardTitle>
              <CardDescription className="text-[15px] leading-relaxed">
                A clear multi-tenant boundary for people, teams, invitations,
                and the active organization context.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {["organization context", "teams", "member invitations"].map(
                (tag) => (
                  <Badge key={tag} variant="outline" className="font-mono">
                    {tag}
                  </Badge>
                ),
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col">
            {capabilities.map(({ title, description, icon: Icon }, index) => (
              <div key={title}>
                {index > 0 && <Separator />}
                <div
                  className={cn(
                    "flex gap-4 py-4",
                    index === 0 && "pt-0",
                    index === capabilities.length - 1 && "pb-0",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <div>
                    <h3 className="font-semibold text-base">{title}</h3>
                    <p className="mt-1.5 max-w-[56ch] text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
