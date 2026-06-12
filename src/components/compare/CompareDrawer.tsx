"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/primitives";
import { useCompare } from "@/lib/compare/store";
import { RARITY } from "@/components/fut/rarity";
import { cn, formatCoins } from "@/lib/utils";
import type { PlayerView } from "@/components/fut/types";

const STATS: [string, keyof PlayerView][] = [
  ["Pace", "pace"],
  ["Shooting", "shooting"],
  ["Passing", "passing"],
  ["Dribbling", "dribbling"],
  ["Defending", "defending"],
  ["Physical", "physical"],
];

function num(p: PlayerView, k: keyof PlayerView): number {
  return (p[k] as number) ?? 0;
}

function Header({ p }: { p: PlayerView }) {
  const r = RARITY[p.rarity];
  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-display text-4xl font-bold tabular-nums leading-none" style={{ color: r.accent }}>
        {p.rating}
      </span>
      <p className="mt-2 line-clamp-2 text-sm font-semibold">{p.name}</p>
      <span className="label mt-1">{p.positions.slice(0, 2).join(" · ")}</span>
    </div>
  );
}

function Row({
  label,
  a,
  b,
  betterIs = "high",
  format,
  render,
}: {
  label: string;
  a: number;
  b: number;
  betterIs?: "high" | "low";
  format?: (n: number) => string;
  render?: (n: number) => React.ReactNode;
}) {
  const aWin = betterIs === "high" ? a > b : a < b;
  const bWin = betterIs === "high" ? b > a : b < a;
  const fmt = (n: number) => (render ? render(n) : format ? format(n) : n);
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-[var(--color-line)] py-2.5">
      <span className={cn("text-right font-mono text-sm tabular-nums", aWin ? "font-semibold text-[var(--color-accent)]" : "text-[var(--color-muted)]")}>
        {fmt(a)}
      </span>
      <span className="label w-20 text-center">{label}</span>
      <span className={cn("text-left font-mono text-sm tabular-nums", bWin ? "font-semibold text-[var(--color-accent)]" : "text-[var(--color-muted)]")}>
        {fmt(b)}
      </span>
    </div>
  );
}

function Body({ a, b }: { a: PlayerView; b: PlayerView }) {
  const wins = STATS.reduce(
    (acc, [, k]) => {
      const av = num(a, k);
      const bv = num(b, k);
      if (av > bv) acc[0]++;
      else if (bv > av) acc[1]++;
      return acc;
    },
    [0, 0],
  );

  return (
    <div className="p-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Header p={a} />
        <span className="label">vs</span>
        <Header p={b} />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Badge variant={wins[0] > wins[1] ? "good" : "default"}>{wins[0]} better</Badge>
        <span className="text-[10px] text-[var(--color-faint)]">attributes</span>
        <Badge variant={wins[1] > wins[0] ? "good" : "default"}>{wins[1]} better</Badge>
      </div>

      <div className="mt-5">
        <Row label="Rating" a={a.rating} b={b.rating} />
        {STATS.map(([label, k]) => (
          <Row key={label} label={label} a={num(a, k)} b={num(b, k)} />
        ))}
        {a.skillMoves != null && b.skillMoves != null && (
          <Row label="Skill" a={a.skillMoves} b={b.skillMoves} render={(n) => `${n}★`} />
        )}
        {a.weakFoot != null && b.weakFoot != null && (
          <Row label="Weak foot" a={a.weakFoot} b={b.weakFoot} render={(n) => `${n}★`} />
        )}
        <Row label="Price" a={a.price} b={b.price} betterIs="low" format={formatCoins} />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-center">
        <div>
          <span className="label">Club</span>
          <p className="mt-1 truncate text-xs">{a.club}</p>
        </div>
        <span className="label">·</span>
        <div>
          <span className="label">Club</span>
          <p className="mt-1 truncate text-xs">{b.club}</p>
        </div>
      </div>
    </div>
  );
}

export function CompareDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items } = useCompare();
  const [a, b] = items;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {a && b && (
        <SheetContent size="lg" title="Compare players">
          <Body a={a} b={b} />
        </SheetContent>
      )}
    </Sheet>
  );
}
