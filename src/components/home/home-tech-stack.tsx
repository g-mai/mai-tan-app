const techStack = [
  "TanStack Start",
  "React",
  "Better Auth",
  "Drizzle",
  "Cloudflare Workers",
  "Cloudflare R2",
  "Cloudflare D1",
  "shadcn/ui",
];

export function HomeTechStack() {
  return (
    <section id="stack" className="border-b bg-muted/50">
      <div className="mx-auto flex max-w-300 flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4 sm:px-6">
        <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
          Built with
        </span>
        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {techStack.map((tech, index) => (
            <li key={tech} className="inline-flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden="true" className="text-border">
                  ·
                </span>
              )}
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
