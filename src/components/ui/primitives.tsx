import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ---- Card (panel) ---- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel", className)} {...props} />;
}

/* ---- Label (mono micro-label) ---- */
export function Label({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("label", className)} {...props} />;
}

/* ---- Badge ---- */
const badge = cva(
  "inline-flex items-center gap-1 rounded-full font-medium tracking-tight",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-line)]",
        accent:
          "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-line)]",
        good: "bg-[color-mix(in_srgb,var(--color-up)_14%,transparent)] text-[var(--color-up)] border border-[color-mix(in_srgb,var(--color-up)_30%,transparent)]",
        warn: "bg-[color-mix(in_srgb,var(--color-warn)_14%,transparent)] text-[var(--color-warn)] border border-[color-mix(in_srgb,var(--color-warn)_30%,transparent)]",
        bad: "bg-[color-mix(in_srgb,var(--color-down)_14%,transparent)] text-[var(--color-down)] border border-[color-mix(in_srgb,var(--color-down)_30%,transparent)]",
      },
      size: {
        xs: "px-1.5 py-0 text-[10px]",
        sm: "px-2.5 py-0.5 text-[11px]",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  },
);

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ variant, size }), className)} {...props} />;
}

/* ---- LiveDot — pulsing "live" indicator ---- */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-1.5 w-1.5", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
    </span>
  );
}

/* ---- Kbd — keyboard hint pill ---- */
export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <kbd className={cn("kbd", className)} {...props} />;
}

/* ---- Input ---- */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] px-3 text-[13px] text-[var(--color-fg)] placeholder:text-[var(--color-faint)] border border-[var(--color-line)] transition-colors focus:outline-none focus:border-[var(--color-accent-line)] focus:bg-[var(--color-surface)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/* ---- Skeleton (shimmer) ---- */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}
