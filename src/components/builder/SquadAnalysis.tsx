"use client";

import { squadMetrics } from "@/lib/fut/squad-metrics";
import { StatBar } from "@/components/fut/StatBar";
import type { SlotView } from "@/lib/fut/solve-types";

type Dim = "league" | "nation" | "club";

function inPos(s: SlotView): boolean {
  return !!s.player && s.player.positions.includes(s.position);
}

function group(slots: SlotView[], key: Dim): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const s of slots) {
    if (!inPos(s)) continue;
    const v = s.player![key];
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .filter((x) => x.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

const STATS: [string, keyof NonNullable<SlotView["player"]>][] = [
  ["PAC", "pace"],
  ["SHO", "shooting"],
  ["PAS", "passing"],
  ["DRI", "dribbling"],
  ["DEF", "defending"],
  ["PHY", "physical"],
];

function LinkList({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  return (
    <div>
      <p className="label mb-2">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--color-faint)]">No links yet</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: r.count >= 3 ? "var(--color-up)" : "var(--color-warn)" }}
              />
              <span className="min-w-0 flex-1 truncate text-xs text-[var(--color-fg)]">{r.name}</span>
              <span className="font-mono text-xs tabular-nums text-[var(--color-muted)]">×{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SquadAnalysis({ slots }: { slots: SlotView[] }) {
  const filled = slots.filter((s) => s.player);
  if (filled.length === 0) return null;

  const m = squadMetrics(slots);
  const inPosition = slots.filter(inPos).length;
  const avg = (key: keyof NonNullable<SlotView["player"]>) =>
    Math.round(filled.reduce((s, x) => s + ((x.player![key] as number) ?? 0), 0) / filled.length);

  return (
    <div className="panel mt-4 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Squad analysis</h3>
        <span className="text-xs text-[var(--color-muted)]">
          <span className="font-mono tabular-nums text-[var(--color-fg)]">{inPosition}</span>/{filled.length} in
          position
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* chemistry links */}
        <div className="grid grid-cols-1 gap-4">
          <LinkList title="Leagues" rows={group(slots, "league")} />
          <LinkList title="Nations" rows={group(slots, "nation")} />
          <LinkList title="Clubs" rows={group(slots, "club")} />
        </div>

        {/* stat profile */}
        <div>
          <p className="label mb-3">Average profile</p>
          <div className="flex flex-col gap-2.5">
            {STATS.map(([label, key]) => (
              <StatBar key={label} label={label} value={avg(key)} />
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Team chemistry <span className="font-mono tabular-nums text-[var(--color-fg)]">{m.chemistry}</span>/33
            comes from these shared links — keep players in position to bank it.
          </p>
        </div>
      </div>
    </div>
  );
}
