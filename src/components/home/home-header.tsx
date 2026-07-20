import { Link } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import { Button } from "#/components/ui/button";
import ThemeToggle from "#/features/layout/components/theme-toggle";

const navLinks = [
  { href: "#stack", label: "Stack" },
  { href: "#features", label: "Features" },
  { href: "#roadmap", label: "Roadmap" },
];

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-300 items-center gap-5 px-6">
        <LogoTitle href="/" className="flex items-center gap-2.5 py-0" />
        <nav className="hidden items-center gap-5 font-mono text-[13px] md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        <ThemeToggle />
        <Button variant="ghost" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button
          asChild
          className="transition-transform duration-150 hover:-translate-y-0.5"
        >
          <Link to="/register">Get started</Link>
        </Button>
      </div>
    </header>
  );
}
