import { GitBranch } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-300 flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
        <p>
          © {year} Mai Tan App. Built with TanStack Start, Better Auth, and
          shadcn/ui.
        </p>
        <a
          href="https://github.com/g-mai/mai-tan-app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-xs transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <GitBranch aria-hidden="true" className="size-4" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
