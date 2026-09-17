import type { ReactNode } from "react";

const BRAND_COLOR = "#17967f";
const TEXT_COLOR = "#1f2937";
const MUTED_COLOR = "#6b7280";
const BORDER_COLOR = "#e5e7eb";
const BACKGROUND_COLOR = "#f4f4f5";
const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function EmailLayout({
  previewText,
  children,
}: {
  previewText: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: BACKGROUND_COLOR,
        fontFamily: FONT_FAMILY,
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          display: "none",
          overflow: "hidden",
          lineHeight: "1px",
          opacity: 0,
          maxHeight: 0,
          maxWidth: 0,
        }}
      >
        {previewText}
      </div>
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: `1px solid ${BORDER_COLOR}`,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "32px 32px 0" }}>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: BRAND_COLOR,
              letterSpacing: "0.02em",
            }}
          >
            Mai Tan
          </span>
        </div>
        <div
          style={{
            padding: "24px 32px 32px",
            color: TEXT_COLOR,
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          {children}
        </div>
        <div
          style={{
            borderTop: `1px solid ${BORDER_COLOR}`,
            padding: "20px 32px",
            fontSize: "13px",
            color: MUTED_COLOR,
          }}
        >
          <p style={{ margin: 0 }}>
            <a
              href="https://tan.g-mai.dev"
              style={{ color: MUTED_COLOR, textDecoration: "none" }}
            >
              tan.g-mai.dev
            </a>{" "}
            · Do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        fontSize: "20px",
        fontWeight: 700,
        color: TEXT_COLOR,
        margin: "0 0 16px",
      }}
    >
      {children}
    </h1>
  );
}

export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: BRAND_COLOR,
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 600,
        textDecoration: "none",
        padding: "12px 24px",
        borderRadius: "8px",
        margin: "8px 0 16px",
      }}
    >
      {children}
    </a>
  );
}

export function EmailMutedText({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: "13px", color: MUTED_COLOR, lineHeight: "1.6" }}>
      {children}
    </p>
  );
}
