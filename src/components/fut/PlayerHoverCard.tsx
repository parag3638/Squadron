"use client";

import * as React from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Sparkline } from "@/components/market/Sparkline";
import { RARITY } from "./rarity";
import { marketFields } from "@/lib/market/pricing";
import { usePlayerPreview } from "@/lib/ui/player-cache";
import { formatCoins } from "@/lib/utils";
import type { PlayerView } from "./types";

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
const GK_LABELS = ["DIV", "HAN", "KIC", "REF", "SPD", "POS"] as const;

/** Wraps any element so hovering reveals a rich player preview card. */
export function PlayerHoverCard({
  player,
  playerId,
  children,
  side = "top",
  align = "center",
}: {
  player?: PlayerView;
  playerId?: number;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} align={align} className="w-[280px] p-0">
        <PreviewBody seed={player} id={playerId ?? player?.id} />
      </HoverCardContent>
    </HoverCard>
  );
}

function PreviewBody({ seed, id }: { seed?: PlayerView; id?: number }) {
  const player = usePlayerPreview(id, seed);
  if (!player) {
    return <div className="p-4 text-sm text-[var(--color-muted)]">Loading…</div>;
  }
  const r = RARITY[player.rarity];
  const isGK = player.positions[0] === "GK";
  const stats = [
    player.pace,
    player.shooting,
    player.passing,
    player.dribbling,
    player.defending,
    player.physical,
  ];
  const labels = isGK ? GK_LABELS : STAT_LABELS;
  const m = marketFields(player);
  const up = m.trendPct >= 0;

  return (
    <div>
      <div
        className="flex items-start gap-3 p-3.5"
        style={{ background: `linear-gradient(176deg, ${r.sheen} 0%, transparent 65%)` }}
      >
        <span className="font-mono text-3xl font-bold tabular-nums leading-none" style={{ color: r.accent }}>
          {player.rating}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold uppercase tracking-wide">{player.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">
            {player.positions.join(" · ")} · {player.club}
          </p>
          <p className="truncate text-[11px] text-[var(--color-faint)]">
            {player.league} · {player.nation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-px border-t border-[var(--color-line)] px-3.5 py-2.5">
        {labels.map((l, i) => (
          <div key={l} className="flex flex-col items-center gap-0.5">
            <span className="font-mono text-[8px] tracking-wider text-[var(--color-faint)]">{l}</span>
            <span className="cell-num text-[11px] font-semibold">{stats[i] ?? "–"}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--color-line)] px-3.5 py-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="h-1.5 w-1.5 self-center rounded-full bg-[var(--color-gold)]" />
          <span className="cell-num text-sm font-medium text-[var(--color-gold)]">{formatCoins(player.price)}</span>
          <span
            className="cell-num text-[11px]"
            style={{ color: up ? "var(--color-up)" : "var(--color-down)" }}
          >
            {up ? "+" : ""}
            {m.trendPct.toFixed(1)}%
          </span>
        </div>
        <Sparkline data={m.history} color={up ? "var(--color-up)" : "var(--color-down)"} width={84} height={26} />
      </div>
    </div>
  );
}
