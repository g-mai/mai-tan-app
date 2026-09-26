import { Link } from "@tanstack/react-router";
import { LogoTitle } from "#/components/shared/logo-title";
import { Button } from "#/components/ui/button";
import ThemeToggle from "#/features/layout/components/theme-toggle";

const navLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#features", label: "Features" },
];

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-300 items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <LogoTitle
          href="/"
          className="min-w-0 flex items-center gap-2.5 py-0 max-[380px]:[&>div:last-child]:hidden"
        />
        <nav className="hidden items-center gap-5 text-sm md:flex">
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
        <Button asChild>
          <Link to="/register">Get started</Link>
        </Button>
      </div>
    </header>
  );
}
