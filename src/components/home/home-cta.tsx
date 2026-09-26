import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "#/components/ui/button";

export function HomeCta() {
  return (
    <section id="get-started">
      <div className="mx-auto max-w-300 px-4 py-16 sm:px-6 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-md sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in oklch, var(--primary-foreground) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary-foreground) 12%, transparent) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(90% 120% at 100% 0%, #000, transparent 70%)",
            }}
          />
          <div className="relative max-w-[60ch]">
            <div className="font-mono text-xs">{"// see it for yourself"}</div>
            <h2 className="mt-3 font-bold text-[32px] leading-[1.08] tracking-tight sm:text-[38px]">
              Set up your workspace in minutes.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed sm:text-base">
              Start with your email, move through the guided setup, and see how
              the organization and team foundation fits together.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">
                  Get started
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-primary-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/60"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
