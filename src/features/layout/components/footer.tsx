import { GitBranch } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t font-mono text-[12.5px] text-muted-foreground">
      <div className="mx-auto flex max-w-300 flex-col items-center justify-between gap-3 px-6 py-9 sm:flex-row">
        <p>
          © {year} Mai Tan App. Built with TanStack Start, Better Auth, and
          shadcn/ui.
        </p>
        <a
          href="https://github.com/g-mai/mai-tan-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <GitBranch className="size-3.5" /> GitHub
        </a>
      </div>
    </footer>
  );
}
