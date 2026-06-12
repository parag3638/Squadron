"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useWatchlist } from "@/lib/market/watchlist";
import { marketFields } from "@/lib/market/pricing";
import { MarketRow } from "./MarketRow";
import { SectionHeader } from "@/components/site/Section";
import type { MarketPlayer } from "@/lib/market/types";
import type { PlayerView } from "@/components/fut/types";

export function Watchlist() {
  const { ids, toggle } = useWatchlist();
  const [players, setPlayers] = useState<MarketPlayer[]>([]);
  const key = ids.join(",");

  useEffect(() => {
    if (!ids.length) return;
    fetch(`/api/players?ids=${key}`)
      .then((r) => r.json())
      .then((d) => setPlayers(d.items.map((p: PlayerView) => ({ ...p, ...marketFields(p) }))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const idSet = new Set(ids);
  const shown = players.filter((p) => idSet.has(p.id));

  return (
    <section className="mt-12">
      <SectionHeader title="Your watchlist" subtitle="Star players on this page to track their estimated price." />
      {ids.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-line-2)] py-12 text-sm text-[var(--color-muted)]">
          <Star className="h-4 w-4" /> Nothing tracked yet — tap the star on any player.
        </div>
      ) : (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {shown.map((p) => (
            <MarketRow key={p.id} p={p} watched onWatch={() => toggle(p.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
