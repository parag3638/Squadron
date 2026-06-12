import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn, formatCoins } from "@/lib/utils";
import { RARITY } from "./rarity";
import type { ShapedSolve } from "@/lib/fut/solve-types";

export function SquadSummaryCard({
  title,
  tag,
  solve,
  href,
}: {
  title: string;
  tag?: string;
  solve: ShapedSolve;
  href: string;
}) {
  const top = solve.slots
    .map((s) => s.player)
    .filter((p): p is NonNullable<typeof p> => !!p)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const chemColor =
    solve.chemistry >= 27 ? "var(--color-good)" : solve.chemistry >= 18 ? "var(--color-warn)" : "var(--color-bad)";

  return (
    <Link href={href} className="panel panel-interactive group flex flex-col p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-base font-bold leading-tight">{title}</p>
          {tag && <p className="label mt-1">{tag}</p>}
        </div>
        <span className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-2)] px-2 py-1 font-mono text-[11px] font-medium text-[var(--color-muted)]">
          {solve.formation}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-4">
        <Stat label="Rating" value={String(solve.rating)} />
        <Stat label="Chem" value={`${solve.chemistry}`} color={chemColor} />
        <Stat label="Est." value={formatCoins(solve.cost)} color="var(--color-gold)" />
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-[var(--color-line)] pt-3">
        {top.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <span
              className="w-6 font-mono text-sm font-bold tabular-nums"
              style={{ color: RARITY[p.rarity].accent }}
            >
              {p.rating}
            </span>
            <span className="flex-1 truncate text-xs text-[var(--color-fg)]">{p.name}</span>
            <span className="text-[10px] text-[var(--color-faint)]">{p.positions[0]}</span>
          </div>
        ))}
      </div>

      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)]">
        Open <ArrowUpRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col">
      <span
        className={cn("font-mono text-xl font-bold tabular-nums leading-none")}
        style={{ color: color ?? "var(--color-fg)" }}
      >
        {value}
      </span>
      <span className="label mt-1.5">{label}</span>
    </div>
  );
}
