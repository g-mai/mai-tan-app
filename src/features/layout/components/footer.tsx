import { GitBranch } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t font-mono text-xs text-muted-foreground">
      <div className="flex flex-col items-center justify-between gap-3 px-8 py-5 sm:flex-row">
        <p>
          © {year} Mai Tan App. Built with TanStack Start, Better Auth, and
          shadcn/ui.
        </p>
        <a
          href="https://github.com/g-mai/mai-tan-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-foreground"
        >
          <GitBranch className="size-4" /> GitHub
        </a>
      </div>
    </footer>
  );
}
