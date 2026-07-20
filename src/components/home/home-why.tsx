import {
  Blocks,
  Layers,
  type LucideIcon,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { IconCard } from "#/components/home/icon-card";

const whyPoints: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Skip months of setup",
    description:
      "Sign-up, login, teams, billing — built once, properly. Start on your idea, not the plumbing.",
    icon: Rocket,
  },
  {
    title: "Secure from line one",
    description:
      "Access control and tenant isolation built in at every layer, enforced by default.",
    icon: ShieldCheck,
  },
  {
    title: "Complete, not a template",
    description:
      "No dead links. Everything that ships is a working end-to-end flow.",
    icon: Blocks,
  },
  {
    title: "Built to be extended",
    description:
      "Consistent patterns run through the codebase, so adding features feels like a cleared path.",
    icon: Layers,
  },
];

export function HomeWhy() {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-300 grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:py-22">
        <div>
          <div className="font-medium font-mono text-secondary text-xs">
            {"// why we built this"}
          </div>
          <h2 className="mt-3.5 font-bold text-3xl leading-[1.1] tracking-tight sm:text-[34px]">
            Every team rebuilds
            <br />
            the same foundation first.
          </h2>
        </div>
        <div>
          <p className="text-base text-muted-foreground leading-relaxed">
            Accounts, organizations, permissions, billing, email — it takes
            months, and none of it is the idea you set out to build. Mai Tan App
            is that foundation, built once and built well, so you can start on
            the part that makes your product yours.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {whyPoints.map((point) => (
              <IconCard key={point.title} {...point} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
