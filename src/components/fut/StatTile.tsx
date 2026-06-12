import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-[clamp(1.75rem,3vw,2.25rem)]",
} as const;

/** One number, one label — the shared voice for every stat across the app. */
export function StatTile({
  label,
  value,
  sub,
  color,
  size = "md",
  align = "center",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  color?: string;
  size?: keyof typeof SIZE;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <span
        className={cn("cell-num font-bold leading-none tracking-tight", SIZE[size])}
        style={{ color: color ?? "var(--color-fg)" }}
      >
        {value}
        {sub != null && <span className="text-[0.5em] text-[var(--color-faint)]">{sub}</span>}
      </span>
      <span className="label">{label}</span>
    </div>
  );
}
