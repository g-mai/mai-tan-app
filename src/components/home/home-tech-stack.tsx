const techStack = [
  "TanStack Start",
  "React 19",
  "TypeScript",
  "Tailwind v4",
  "Better Auth",
  "Drizzle ORM",
  "PostgreSQL",
  "shadcn/ui",
  "TanStack Query",
  "Resend",
  "Sentry",
  "Biome",
];

export function HomeTechStack() {
  return (
    <section id="stack" className="scroll-mt-15 border-b bg-muted">
      <div className="mx-auto flex max-w-300 flex-wrap items-center gap-6 px-6 py-5.5">
        <span className="whitespace-nowrap font-medium font-mono text-muted-foreground text-xs">
          Built with
        </span>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border bg-card px-2.75 py-1.25 font-mono text-[12.5px] shadow-[1px_1px_0_0_rgba(0,0,0,0.06)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
