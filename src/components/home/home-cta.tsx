import { Link } from "@tanstack/react-router";
import { Terminal } from "lucide-react";
import { Button } from "#/components/ui/button";
import { DemoButton } from "#/features/demo/components/demo-button";

export function HomeCta() {
  return (
    <section id="demo">
      <div className="mx-auto max-w-300 px-6 py-16 lg:py-22">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-[6px_6px_0_0_rgba(0,0,0,0.16)] sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(90% 120% at 100% 0%, #000, transparent 70%)",
            }}
          />
          <div className="relative max-w-150">
            <div className="font-mono text-xs opacity-80">
              {"// see it for yourself"}
            </div>
            <h2 className="mt-3 font-bold text-[32px] leading-[1.08] tracking-tight sm:text-[38px]">
              Spin up a live demo in one click.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed opacity-95 sm:text-base">
              A fully-populated account, no sign-up required. Explore the
              organizations, teams, and settings exactly as your users would.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <DemoButton
                size="lg"
                className="gap-2 bg-primary-foreground! text-primary! transition-transform duration-150 hover:-translate-y-0.5 hover:bg-primary-foreground/90! w-fit px-10!"
              >
                <Terminal /> Explore the demo
              </DemoButton>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/45 bg-transparent text-primary-foreground shadow-none transition-transform duration-150 hover:-translate-y-0.5 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link to="/register">Create an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
