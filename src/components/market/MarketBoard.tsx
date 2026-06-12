"use client";

import { useWatchlist } from "@/lib/market/watchlist";
import { SectionHeader } from "@/components/site/Section";
import { MarketRow } from "./MarketRow";
import type { MarketPlayer } from "@/lib/market/types";

export function MarketBoard({
  bestBuys,
  up,
  down,
}: {
  bestBuys: MarketPlayer[];
  up: MarketPlayer[];
  down: MarketPlayer[];
}) {
  const { has, toggle } = useWatchlist();
  const row = (p: MarketPlayer, showValue?: boolean) => (
    <MarketRow key={p.id} p={p} showValue={showValue} watched={has(p.id)} onWatch={() => toggle(p.id)} />
  );

  return (
    <>
      <section className="mt-10">
        <SectionHeader title="Best value picks" subtitle="The most rating for the fewest coins right now." />
        <div className="grid gap-1.5 sm:grid-cols-2">{bestBuys.map((p) => row(p, true))}</div>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader title="Biggest risers" subtitle="Trending up — sell into the spike." />
          <div className="flex flex-col gap-1.5">{up.map((p) => row(p))}</div>
        </div>
        <div>
          <SectionHeader title="Biggest fallers" subtitle="Trending down — snipe the dip." />
          <div className="flex flex-col gap-1.5">{down.map((p) => row(p))}</div>
        </div>
      </section>
    </>
  );
}
