"use client";

import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { RARITY } from "@/components/fut/rarity";
import { PlayerHoverCard } from "@/components/fut/PlayerHoverCard";
import { cn, formatCoins } from "@/lib/utils";
import { Sparkline } from "./Sparkline";
import type { MarketPlayer } from "@/lib/market/types";

const SIGNAL: Record<MarketPlayer["signal"], { variant: "good" | "warn" | "default"; label: string }> = {
  buy: { variant: "good", label: "Buy" },
  sell: { variant: "warn", label: "Sell" },
  hold: { variant: "default", label: "Hold" },
};

export function MarketRow({
  p,
  watched,
  onWatch,
  showValue,
}: {
  p: MarketPlayer;
  watched?: boolean;
  onWatch?: () => void;
  showValue?: boolean;
}) {
  const up = p.trendPct >= 0;
  const trendColor = up ? "var(--color-good)" : "var(--color-bad)";
  return (
    <PlayerHoverCard player={p} side="top" align="start">
      <div className="panel panel-interactive flex items-center gap-3 px-3.5 py-2.5">
        <span className="w-7 cell-num text-lg font-bold" style={{ color: RARITY[p.rarity].accent }}>
          {p.rating}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{p.name}</p>
          <p className="truncate text-xs text-[var(--color-faint)]">
            {p.positions[0]} · {p.club}
          </p>
        </div>

        <Sparkline data={p.history} color={trendColor} />

        <div className="hidden w-14 items-center justify-end gap-0.5 cell-num text-xs font-medium sm:flex" style={{ color: trendColor }}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(p.trendPct).toFixed(1)}%
        </div>

        {showValue ? (
          <Badge variant="accent" className="hidden sm:inline-flex">
            Value {p.value}
          </Badge>
        ) : (
          <Badge variant={SIGNAL[p.signal].variant} className="hidden sm:inline-flex">
            {SIGNAL[p.signal].label}
          </Badge>
        )}

        <span className="w-16 text-right cell-num text-sm font-semibold text-[var(--color-gold)]">
          {formatCoins(p.price)}
        </span>

        {onWatch && (
          <button
            onClick={onWatch}
            aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
            className={cn(
              "rounded-full p-1 transition-colors",
              watched ? "text-[var(--color-gold)]" : "text-[var(--color-faint)] hover:text-[var(--color-fg)]",
            )}
          >
            <Star className={cn("h-4 w-4", watched && "fill-current")} />
          </button>
        )}
      </div>
    </PlayerHoverCard>
  );
}
