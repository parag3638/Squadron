import type { SquadSlot } from "./types";
import { calcSquadRating } from "./rating";
import { calcChemistry } from "./chemistry";

/**
 * A practical subset of EA's SBC requirement types — enough to express the vast
 * majority of real challenges (rating floors, chemistry, league/nation counts,
 * squad diversity, quality minimums). The solver targets these; the evaluator
 * reports exactly which ones a squad fails.
 */
export interface SbcConstraints {
  squadSize: number; // usually 11
  minRating?: number; // team rating >=
  minChemistry?: number; // team chemistry >= (0–33)
  minGoldPlayers?: number; // players with rating >= 75
  minPlayersRated?: { rating: number; count: number }; // >= count players rated >= rating
  fromLeague?: { league: string; count: number }; // >= count from a named league
  fromNation?: { nation: string; count: number }; // >= count from a named nation
  sameLeagueMin?: number; // the most-represented league has >= N
  sameNationMin?: number; // the most-represented nation has >= N
  minLeagues?: number; // distinct leagues among filled players
  minNations?: number; // distinct nations among filled players
}

export interface SbcCheck {
  ok: boolean;
  rating: number;
  chemistry: number;
  failures: string[];
}

function maxByKey<T>(items: T[], key: (t: T) => string): number {
  const counts = new Map<string, number>();
  let max = 0;
  for (const it of items) {
    const k = key(it);
    const n = (counts.get(k) ?? 0) + 1;
    counts.set(k, n);
    if (n > max) max = n;
  }
  return max;
}

export function evaluateSquadConstraints(slots: SquadSlot[], c: SbcConstraints): SbcCheck {
  const filled = slots.flatMap((s) => (s.player ? [s.player] : []));
  const ratings = slots.map((s) => s.player?.rating ?? 0);
  const rating = calcSquadRating(ratings);
  const chemistry = calcChemistry(slots).total;
  const failures: string[] = [];

  if (filled.length < c.squadSize) {
    failures.push(`Needs ${c.squadSize} players (have ${filled.length})`);
  }
  if (c.minRating != null && rating < c.minRating) {
    failures.push(`Team rating ${rating} < ${c.minRating}`);
  }
  if (c.minChemistry != null && chemistry < c.minChemistry) {
    failures.push(`Chemistry ${chemistry} < ${c.minChemistry}`);
  }
  if (c.minGoldPlayers != null) {
    const gold = filled.filter((p) => p.rating >= 75).length;
    if (gold < c.minGoldPlayers) failures.push(`Gold players ${gold} < ${c.minGoldPlayers}`);
  }
  if (c.minPlayersRated) {
    const n = filled.filter((p) => p.rating >= c.minPlayersRated!.rating).length;
    if (n < c.minPlayersRated.count)
      failures.push(`Players rated ${c.minPlayersRated.rating}+ : ${n} < ${c.minPlayersRated.count}`);
  }
  if (c.fromLeague) {
    const n = filled.filter((p) => p.league === c.fromLeague!.league).length;
    if (n < c.fromLeague.count)
      failures.push(`${c.fromLeague.league}: ${n} < ${c.fromLeague.count}`);
  }
  if (c.fromNation) {
    const n = filled.filter((p) => p.nation === c.fromNation!.nation).length;
    if (n < c.fromNation.count)
      failures.push(`${c.fromNation.nation}: ${n} < ${c.fromNation.count}`);
  }
  if (c.sameLeagueMin != null && maxByKey(filled, (p) => p.league) < c.sameLeagueMin) {
    failures.push(`Max same-league count < ${c.sameLeagueMin}`);
  }
  if (c.sameNationMin != null && maxByKey(filled, (p) => p.nation) < c.sameNationMin) {
    failures.push(`Max same-nation count < ${c.sameNationMin}`);
  }
  if (c.minLeagues != null) {
    const distinct = new Set(filled.map((p) => p.league)).size;
    if (distinct < c.minLeagues) failures.push(`Distinct leagues ${distinct} < ${c.minLeagues}`);
  }
  if (c.minNations != null) {
    const distinct = new Set(filled.map((p) => p.nation)).size;
    if (distinct < c.minNations) failures.push(`Distinct nations ${distinct} < ${c.minNations}`);
  }

  return { ok: failures.length === 0, rating, chemistry, failures };
}
