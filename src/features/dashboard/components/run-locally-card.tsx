import { Check, Copy, Sparkles, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { installPrompt } from "#/features/dashboard/lib/install-prompt";
import { Button } from "@/components/ui/button";

const prerequisites = [
  { label: "Node.js 22.22.2+", check: "node -v" },
  { label: "pnpm 11+", check: "pnpm -v" },
  { label: "Port 3000 free", check: "lsof -i :3000" },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm border bg-muted px-1.5 py-0.5 font-mono text-xs">
      {children}
    </code>
  );
}

/** One line of the fake terminal. Comments and the prompt glyph are dimmed. */
function Line({
  glyph,
  comment,
  indent,
  children,
}: {
  glyph?: string;
  comment?: boolean;
  indent?: boolean;
  children?: React.ReactNode;
}) {
  if (comment) {
    return (
      <div className="mt-3 text-muted-foreground/75 first:mt-0">{children}</div>
    );
  }

  return (
    <div className={indent ? "pl-4" : undefined}>
      {glyph && <span className="text-primary">{glyph} </span>}
      {children}
    </div>
  );
}

export function RunLocallyCard() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(installPrompt);
    } catch (error) {
      console.error("Copy install prompt failed:", error);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <SquareTerminal className="size-4 text-muted-foreground" />
          <p className="text-base font-semibold">Run it locally</p>
        </div>
        <span className="font-mono text-2xs text-muted-foreground">
          fresh clone to a running app in about five minutes
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 pb-4">
        <span className="mr-1 font-mono text-2xs tracking-widest text-muted-foreground uppercase">
          Prerequisites
        </span>
        {prerequisites.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-2.5 py-1 text-xs"
          >
            <Check className="size-4 text-primary" />
            {item.label}
            <code className="font-mono text-2xs text-muted-foreground">
              {item.check}
            </code>
          </span>
        ))}
      </div>

      <div className="grid border-t lg:grid-cols-[1.15fr_1fr]">
        <div className="border-b px-6 py-5 lg:border-r lg:border-b-0">
          {/* Always dark: `dark` re-declares the theme tokens for this subtree,
              so the terminal keeps its palette in either theme. */}
          <div className="dark overflow-hidden rounded-lg border bg-background">
            <div className="flex h-8 items-center border-b px-3">
              <span className="font-mono text-2xs text-muted-foreground">
                zsh — ~/mai-tan-app
              </span>
            </div>
            <div className="px-4 pt-3 pb-4 font-mono text-xs leading-[1.8] text-foreground wrap-anywhere">
              <Line comment># 1 · clone and install</Line>
              <Line glyph="$">
                git clone https://github.com/g-mai/mai-tan-app
              </Line>
              <Line glyph="$">cd mai-tan-app && pnpm install</Line>
              <Line comment>
                # 2 · env — local defaults plus a real session secret
              </Line>
              <Line glyph="$">cp .env.example .env</Line>
              <Line glyph="$">
                cp .dev.vars.example .dev.vars && perl -pi -e \
              </Line>
              <Line indent>
                "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand
                -base64 32)|" .dev.vars
              </Line>
              <Line comment># 3 · local D1 schema</Line>
              <Line glyph="$">pnpm db:migrate:local</Line>
              <Line comment># 4 · run</Line>
              <Line glyph="$">pnpm dev</Line>
              <Line glyph="→">local&nbsp;&nbsp;http://localhost:3000</Line>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div>
            <p className="mb-1 text-[13px] font-semibold">Two env files</p>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              <Code>.env</Code> is read by Node — Drizzle Kit and the Vite
              build. <Code>.dev.vars</Code> is read by the Worker. Resend and R2
              may stay blank until you use email or image uploads. On Linux,{" "}
              <Code>sed -i</Code> can replace <Code>perl -pi -e</Code>.
            </p>
          </div>
          <div>
            <p className="mb-1 text-[13px] font-semibold">
              No database to install
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              D1 runs locally inside Miniflare, which <Code>pnpm dev</Code>{" "}
              starts for you. Tables do not exist yet on a fresh clone, so{" "}
              <Code>pnpm db:migrate:local</Code> comes first. To start clean,
              delete <Code>.wrangler/state/v3/d1</Code> and migrate again.
            </p>
          </div>
          <div className="rounded-lg border bg-muted px-4 py-3">
            <p className="mb-2 font-mono text-2xs tracking-widest text-muted-foreground uppercase">
              Before you sign up
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              Registering needs a real Resend key — sign-up sends a 6-digit OTP
              and never logs the code. Put a real key in{" "}
              <Code>RESEND_API_KEY</Code> and set{" "}
              <Code>FROM_ADDRESS_EMAIL</Code> to{" "}
              <Code>onboarding@resend.dev</Code>, Resend's test sender, which
              only delivers to your own address.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap max-lg:flex-col  items-center justify-between gap-6 border-t px-6 py-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight">
              Prefer to let an agent do it?
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed">
              Paste the install prompt into Claude Code, Codex, or any coding
              agent, from the directory where the project should live.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {copied && (
            <span className="inline-flex items-center gap-2 font-mono text-2xs text-primary">
              <Check className="size-4" />
              Copied
            </span>
          )}
          <Button onClick={copy}>
            <Copy className="size-4" />
            Copy install prompt
          </Button>
        </div>
      </div>
    </div>
  );
}
