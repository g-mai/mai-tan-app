import { Blocks, Layers, type LucideIcon, ShieldCheck } from "lucide-react";
import { cn } from "#/lib/utils";

const whyPoints: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Start with a working foundation",
    description:
      "Authentication, organizations, teams, onboarding, and email flows are ready to explore and extend.",
    icon: Layers,
  },
  {
    title: "Inherit secure organization patterns",
    description:
      "Sessions, active organization context, and protected routes give every feature a clear place to start.",
    icon: ShieldCheck,
  },
  {
    title: "Extend a consistent codebase",
    description:
      "Typed forms, server functions, and query patterns make the next feature feel like a continuation—not a rewrite.",
    icon: Blocks,
  },
];

export function HomeWhy() {
  return (
    <section id="why" className="border-b">
      <div className="mx-auto grid max-w-300 grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
        <div>
          <div className="font-mono text-xs text-muted-foreground">
            {"// why start here"}
          </div>
          <h2 className="mt-3.5 max-w-120 font-bold text-3xl leading-[1.1] tracking-tight sm:text-[34px]">
            Skip the foundation work that every team repeats.
          </h2>
        </div>
        <div>
          <p className="max-w-[60ch] text-base text-muted-foreground leading-relaxed">
            Start with the parts of a B2B product that need careful decisions,
            then spend your time on the idea that makes your product different.
          </p>
          <div className="mt-8 flex flex-col">
            {whyPoints.map(({ title, description, icon: Icon }, index) => (
              <div
                key={title}
                className="flex gap-4 border-t py-6 first:border-t-0 first:pt-0 last:pb-0"
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 size-5 shrink-0 text-muted-foreground",
                    index === 0 && "text-primary",
                  )}
                />
                <div>
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="mt-1.5 max-w-[52ch] text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
