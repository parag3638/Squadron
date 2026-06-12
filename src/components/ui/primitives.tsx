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
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
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
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ variant }), className)} {...props} />;
}

/* ---- Input ---- */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] px-3.5 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-faint)] border border-[var(--color-line)] transition-colors focus:outline-none focus:border-[var(--color-accent-line)] focus:bg-[var(--color-surface)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/* ---- Select (native, styled) ---- */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-10 w-full appearance-none rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] pl-3.5 pr-9 text-sm text-[var(--color-fg)] border border-[var(--color-line)] transition-colors focus:outline-none focus:border-[var(--color-accent-line)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-faint)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
));
Select.displayName = "Select";

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
