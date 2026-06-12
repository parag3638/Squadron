"use client";

import { RARITY } from "@/components/fut/rarity";
import { PlayerHoverCard } from "@/components/fut/PlayerHoverCard";
import { formatCoins } from "@/lib/utils";
import type { PlayerView } from "@/components/fut/types";

/** Top-rated leaderboard — dense flush rows with hover previews (client island). */
export function TopRatedList({ players }: { players: PlayerView[] }) {
  return (
    <div className="panel list-flush overflow-hidden p-1">
      {players.map((p, i) => (
        <PlayerHoverCard key={p.id} player={p} side="right" align="start">
          <div className="data-row cursor-default">
            <span className="w-4 shrink-0 text-center font-mono text-xs text-[var(--color-faint)]">{i + 1}</span>
            <span
              className="w-7 shrink-0 cell-num text-lg font-bold leading-none"
              style={{ color: RARITY[p.rarity].accent }}
            >
              {p.rating}
            </span>
            <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
            <span className="text-xs text-[var(--color-faint)]">{p.positions[0]}</span>
            <span className="w-16 shrink-0 text-right cell-num text-xs text-[var(--color-muted)]">
              {formatCoins(p.price)}
            </span>
          </div>
        </PlayerHoverCard>
      ))}
    </div>
  );
}

/** Cheapest 84+ anchors — 2-col grid of hoverable mini cards (client island). */
export function ValuePicksGrid({ players }: { players: PlayerView[] }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {players.map((p) => (
        <PlayerHoverCard key={p.id} player={p} side="top" align="center">
          <div className="panel panel-interactive flex cursor-default items-center gap-2.5 px-3 py-2">
            <span
              className="w-6 shrink-0 cell-num text-base font-bold leading-none"
              style={{ color: RARITY[p.rarity].accent }}
            >
              {p.rating}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium">{p.name}</span>
            <span className="shrink-0 cell-num text-xs text-[var(--color-muted)]">{formatCoins(p.price)}</span>
          </div>
        </PlayerHoverCard>
      ))}
    </div>
  );
}
