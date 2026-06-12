import { Info } from "lucide-react";
import { MarketBoard } from "@/components/market/MarketBoard";
import { Watchlist } from "@/components/market/Watchlist";
import { SellFromClub } from "@/components/market/SellFromClub";
import { bestBuys, movers } from "@/lib/market/market";

export const metadata = { title: "Market · Squadron" };

export default function MarketPage() {
  const buys = bestBuys(12);
  const { up, down } = movers(8);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
      <header className="mb-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Market</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Best buys, what to sell, and price trends across the FC26 player pool.
        </p>
      </header>

      <div className="flex items-start gap-2 rounded-xl bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-muted)] border border-[var(--color-line)]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-info)]" />
        <span>
          Prices and trends are a deterministic <strong>estimated model</strong>, not the live transfer market.
          Add a FutDB key to swap in real prices.
        </span>
      </div>

      <MarketBoard bestBuys={buys} up={up} down={down} />
      <Watchlist />
      <SellFromClub />
    </div>
  );
}
