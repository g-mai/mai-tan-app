import {
  CheckCircle2,
  Circle,
  CircleDashed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "#/lib/utils";

type RoadmapGroup = {
  title: string;
  note: string;
  color: string;
  dot: LucideIcon;
  items: string[];
};

const roadmap: RoadmapGroup[] = [
  {
    title: "Shipped",
    note: "working today",
    color: "text-primary",
    dot: CheckCircle2,
    items: [
      "Multi-tenant organizations",
      "Organization & team management",
      "Secure sign-up, login & sessions",
      "Account settings — email, password, profile",
      "Transactional emails",
      "Instant guest demo mode",
      "Light & dark themes",
    ],
  },
  {
    title: "Coming next",
    note: "in active development",
    color: "text-secondary",
    dot: CircleDashed,
    items: [
      "Member invitations & roles",
      "Avatar & logo uploads",
      "Billing & subscriptions (Stripe)",
      "Guided onboarding",
      "Platform admin panel",
      "Automated test suite",
      "Full documentation set",
    ],
  },
  {
    title: "Exploring",
    note: "on the horizon",
    color: "text-muted-foreground",
    dot: Circle,
    items: [
      "Single sign-on (SSO / SAML)",
      "Two-factor authentication",
      "API keys & webhooks",
      "In-app analytics",
      "Per-organization branding",
    ],
  },
];

export function HomeRoadmap() {
  return (
    <section id="roadmap" className="scroll-mt-15 border-b">
      <div className="mx-auto max-w-300 px-6 py-16 lg:py-22">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-140">
            <div className="font-medium font-mono text-secondary text-xs">
              {"// roadmap"}
            </div>
            <h2 className="mt-3.5 font-bold text-3xl leading-[1.1] tracking-tight sm:text-[34px]">
              Where it is, and where it's headed.
            </h2>
          </div>
          <p className="max-w-80 text-muted-foreground text-sm">
            A living foundation that keeps growing. Shipped today, planned next,
            and on the horizon.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {roadmap.map(({ title, note, color, dot: Dot, items }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-5.5 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center gap-2.25">
                <span
                  className={cn("size-2.25 rounded-full bg-current", color)}
                  style={{
                    boxShadow:
                      "0 0 0 3px color-mix(in oklch, currentColor 22%, transparent)",
                  }}
                />
                <span className="font-semibold text-[15px]">{title}</span>
              </div>
              <div className="mt-1 font-mono text-muted-foreground text-xs">
                {note}
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex flex-col gap-2.75">
                {items.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.25 text-[13.5px] leading-tight"
                  >
                    <Dot className={cn("mt-0.5 size-3.75 shrink-0", color)} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
