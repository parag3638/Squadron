"use client";

import { useEffect, useState } from "react";
import { useClub } from "@/lib/club/store";
import { marketFields } from "@/lib/market/pricing";
import { MarketRow } from "./MarketRow";
import { SectionHeader } from "@/components/site/Section";
import type { MarketPlayer } from "@/lib/market/types";
import type { PlayerView } from "@/components/fut/types";

const RANK: Record<MarketPlayer["signal"], number> = { sell: 0, hold: 1, buy: 2 };

export function SellFromClub() {
  const { ids } = useClub();
  const [players, setPlayers] = useState<MarketPlayer[]>([]);
  const key = ids.join(",");

  useEffect(() => {
    if (!ids.length) return;
    fetch(`/api/players?ids=${key}`)
      .then((r) => r.json())
      .then((d) =>
        setPlayers(
          d.items
            .map((p: PlayerView) => ({ ...p, ...marketFields(p) }))
            .sort((a: MarketPlayer, b: MarketPlayer) => RANK[a.signal] - RANK[b.signal] || b.price - a.price),
        ),
      )
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (ids.length === 0) return null;
  const idSet = new Set(ids);
  const shown = players.filter((p) => idSet.has(p.id));

  return (
    <section className="mt-12">
      <SectionHeader
        title="What to sell from your club"
        subtitle="Tradeable players you own, with a buy/sell signal on their estimated price."
        action={{ label: "Manage club", href: "/club" }}
      />
      <div className="grid gap-1.5 sm:grid-cols-2">
        {shown.map((p) => (
          <MarketRow key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
