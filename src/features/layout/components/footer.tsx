export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t px-4 py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p>
          © {year} Mai Tan App. Built with TanStack Start, Better Auth, and
          shadcn/ui.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/g-mai/mai-tan-app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
