"use client";

import { Toaster as Sonner } from "sonner";

/** App-wide toaster, themed to the Squadron tokens. Mounted once in layout. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      offset={24}
      gap={8}
      toastOptions={{
        style: {
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-line-2)",
          borderRadius: "var(--radius-sm)",
          color: "var(--color-fg)",
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 10px 30px -12px rgba(0,0,0,0.8)",
        },
        classNames: {
          description: "!text-[var(--color-muted)]",
          actionButton: "!font-sans",
        },
        actionButtonStyle: {
          background: "var(--color-accent)",
          color: "var(--color-accent-ink)",
          borderRadius: "999px",
          fontWeight: 600,
        },
        cancelButtonStyle: {
          background: "var(--color-surface-3)",
          color: "var(--color-muted)",
          borderRadius: "999px",
        },
      }}
    />
  );
}
