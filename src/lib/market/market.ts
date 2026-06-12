import { searchPlayers } from "@/lib/data/players";
import { marketFields } from "./pricing";
import type { Player } from "@/lib/fut/types";
import type { MarketPlayer } from "./types";

function toMarket(p: Player): MarketPlayer {
  return {
    id: p.id, name: p.name, rating: p.rating, positions: p.positions,
    club: p.club, clubId: p.clubId, league: p.league, leagueId: p.leagueId,
    nation: p.nation, nationId: p.nationId, rarity: p.rarity, price: p.price,
    pace: p.pace, shooting: p.shooting, passing: p.passing,
    dribbling: p.dribbling, defending: p.defending, physical: p.physical,
    ...marketFields(p),
  };
}

// Meta-relevant pool: the players people actually trade.
function pool(): MarketPlayer[] {
  return searchPlayers({ minRating: 82, maxRating: 92, sort: "rating", limit: 1500 }).items.map(toMarket);
}

export function bestBuys(limit = 12): MarketPlayer[] {
  return pool()
    .sort((a, b) => b.value - a.value || b.rating - a.rating)
    .slice(0, limit);
}

export function movers(limit = 8): { up: MarketPlayer[]; down: MarketPlayer[] } {
  const all = pool();
  const up = [...all].sort((a, b) => b.trendPct - a.trendPct).slice(0, limit);
  const down = [...all].sort((a, b) => a.trendPct - b.trendPct).slice(0, limit);
  return { up, down };
}
