import type { Player, Squad, SquadSlot } from "./types";
import { calcSquadRating } from "./rating";
import { calcChemistry } from "./chemistry";
import { evaluateSquadConstraints, type SbcConstraints } from "./sbc";
import { getFormation, DEFAULT_FORMATION } from "./formations";

export interface SolveInput {
  constraints: SbcConstraints;
  /** Candidate players (already filtered/capped by the caller). */
  pool: Player[];
  formation?: string;
  ratingIterations?: number;
  chemIterations?: number;
}

export interface SolveResult {
  ok: boolean;
  squad: Squad;
  rating: number;
  chemistry: number;
  cost: number;
  failures: string[];
  /** True if a search loop hit its iteration cap (solution may be improvable). */
  truncated: boolean;
}

/** Effective coin cost to use a player in a solve — 0 if it's in the user's club. */
const eff = (p: Player) => (p.owned ? 0 : p.price);
const byPrice = (a: Player, b: Player) => eff(a) - eff(b) || a.id - b.id;

function pad(ratings: number[], size: number): number[] {
  const out = ratings.slice(0, size);
  while (out.length < size) out.push(0);
  return out;
}

function maxCountBy(items: Player[], key: (p: Player) => string): number {
  const counts = new Map<string, number>();
  let max = 0;
  for (const it of items) {
    const n = (counts.get(key(it)) ?? 0) + 1;
    counts.set(key(it), n);
    if (n > max) max = n;
  }
  return max;
}

/** Top-N most frequent values of a key among the players (for chem anchors). */
function topModes(items: Player[], key: (p: Player) => string, n: number): string[] {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(key(it), (counts.get(key(it)) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

/** Does a selection still satisfy every *structural* constraint (not rating/chem)? */
function structureOk(sel: Player[], c: SbcConstraints): boolean {
  if (c.fromNation && sel.filter((p) => p.nation === c.fromNation!.nation).length < c.fromNation.count)
    return false;
  if (c.fromLeague && sel.filter((p) => p.league === c.fromLeague!.league).length < c.fromLeague.count)
    return false;
  if (c.minPlayersRated && sel.filter((p) => p.rating >= c.minPlayersRated!.rating).length < c.minPlayersRated.count)
    return false;
  if (c.minGoldPlayers && sel.filter((p) => p.rating >= 75).length < c.minGoldPlayers) return false;
  if (c.minLeagues && new Set(sel.map((p) => p.league)).size < c.minLeagues) return false;
  if (c.minNations && new Set(sel.map((p) => p.nation)).size < c.minNations) return false;
  if (c.sameLeagueMin && maxCountBy(sel, (p) => p.league) < c.sameLeagueMin) return false;
  if (c.sameNationMin && maxCountBy(sel, (p) => p.nation) < c.sameNationMin) return false;
  return true;
}

/**
 * Assign players to a formation's slots, maximising the number of players in a
 * position they can play (which drives chemistry). Scarce slots are filled
 * first, preferring specialised players; leftovers fill remaining slots out of
 * position.
 */
export function assignToFormation(players: Player[], formationName: string): Squad {
  const formation = getFormation(formationName);
  const positions = formation.slots.map((s) => s.position);
  const slots: SquadSlot[] = formation.slots.map((s) => ({ position: s.position, player: null }));
  const unused = [...players];

  const eligible = (pos: string) => unused.filter((p) => p.positions.includes(pos as never)).length;
  const order = slots.map((_, i) => i).sort((a, b) => eligible(positions[a]) - eligible(positions[b]));

  for (const i of order) {
    const pos = positions[i];
    let pick = -1;
    let pickScore = Infinity;
    for (let j = 0; j < unused.length; j++) {
      if (unused[j].positions.includes(pos)) {
        const score = unused[j].positions.length; // prefer specialists
        if (score < pickScore) {
          pickScore = score;
          pick = j;
        }
      }
    }
    if (pick >= 0) {
      slots[i].player = unused[pick];
      unused.splice(pick, 1);
    }
  }
  for (const slot of slots) {
    if (!slot.player && unused.length) slot.player = unused.shift()!;
  }
  return { formation: formationName, slots };
}

export function solveSbc(input: SolveInput): SolveResult {
  const c = input.constraints;
  const size = c.squadSize ?? 11;
  const formationName = input.formation ?? DEFAULT_FORMATION;
  const ratingCap = input.ratingIterations ?? 120;
  const chemCap = input.chemIterations ?? 80;
  let truncated = false;

  // Unique pool by id.
  const seen = new Set<number>();
  const pool = input.pool.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));

  const selected: Player[] = [];
  const usedIds = new Set<number>();
  const take = (p: Player) => {
    selected.push(p);
    usedIds.add(p.id);
  };
  const available = (pred: (p: Player) => boolean) =>
    pool.filter((p) => !usedIds.has(p.id) && pred(p)).sort(byPrice);

  // --- 1. Seed players that establish membership / diversity structure ---
  if (c.fromNation) {
    available((p) => p.nation === c.fromNation!.nation).slice(0, c.fromNation.count).forEach(take);
  }
  if (c.fromLeague) {
    const have = selected.filter((p) => p.league === c.fromLeague!.league).length;
    available((p) => p.league === c.fromLeague!.league)
      .slice(0, Math.max(0, c.fromLeague.count - have))
      .forEach(take);
  }
  if (c.minPlayersRated) {
    const have = selected.filter((p) => p.rating >= c.minPlayersRated!.rating).length;
    available((p) => p.rating >= c.minPlayersRated!.rating)
      .slice(0, Math.max(0, c.minPlayersRated.count - have))
      .forEach(take);
  }
  if (c.minGoldPlayers) {
    const have = selected.filter((p) => p.rating >= 75).length;
    available((p) => p.rating >= 75)
      .slice(0, Math.max(0, c.minGoldPlayers - have))
      .forEach(take);
  }
  if (c.minLeagues) {
    const have = new Set(selected.map((p) => p.league));
    for (const p of available(() => true)) {
      if (have.size >= c.minLeagues || selected.length >= size) break;
      if (!have.has(p.league)) {
        take(p);
        have.add(p.league);
      }
    }
  }
  if (c.minNations) {
    const have = new Set(selected.map((p) => p.nation));
    for (const p of available(() => true)) {
      if (have.size >= c.minNations || selected.length >= size) break;
      if (!have.has(p.nation)) {
        take(p);
        have.add(p.nation);
      }
    }
  }

  // --- 2. Fill to squad size with the cheapest remaining players ---
  for (const p of available(() => true)) {
    if (selected.length >= size) break;
    take(p);
  }

  const ratingOf = (sel: Player[]) => calcSquadRating(pad(sel.map((p) => p.rating), size));
  const chemOf = (sel: Player[]) => calcChemistry(assignToFormation(sel, formationName).slots).total;
  const requiredRating = c.minRating ?? 0;

  /** Apply the best cost-efficient swap that improves `gain`, preserving structure. */
  function bestSwap(
    candidates: Player[],
    gain: (next: Player[], base: number) => number,
    baseValue: number,
    guard?: (next: Player[]) => boolean,
  ): { i: number; q: Player } | null {
    let best: { i: number; q: Player; score: number } | null = null;
    for (let i = 0; i < selected.length; i++) {
      const cur = selected[i];
      for (const q of candidates) {
        const next = selected.slice();
        next[i] = q;
        if (guard && !guard(next)) continue;
        if (!structureOk(next, c)) continue;
        const d = gain(next, baseValue);
        if (d <= 0) continue;
        const dC = Math.max(eff(q) - eff(cur), 1);
        const score = d / dC;
        if (!best || score > best.score) best = { i, q, score };
      }
    }
    return best ? { i: best.i, q: best.q } : null;
  }

  const applySwap = (i: number, q: Player) => {
    usedIds.delete(selected[i].id);
    selected[i] = q;
    usedIds.add(q.id);
  };

  // --- 3. Hill-climb to the rating target with cost-efficient upgrades ---
  if (c.minRating != null) {
    let iter = 0;
    while (ratingOf(selected) < c.minRating) {
      if (iter++ >= ratingCap) {
        truncated = true;
        break;
      }
      const base = ratingOf(selected);
      const candidates = pool.filter((q) => !usedIds.has(q.id) && q.rating > base);
      const swap = bestSwap(candidates, (next) => ratingOf(next) - base, base);
      if (!swap) break;
      applySwap(swap.i, swap.q);
    }
  }

  // --- 4. Improve chemistry without dropping below the rating target ---
  if (c.minChemistry != null) {
    let iter = 0;
    while (chemOf(selected) < c.minChemistry) {
      if (iter++ >= chemCap) {
        truncated = true;
        break;
      }
      const base = chemOf(selected);
      const anchorLeagues = new Set(topModes(selected, (p) => p.league, 2));
      const anchorNations = new Set(topModes(selected, (p) => p.nation, 2));
      const candidates = pool
        .filter(
          (q) =>
            !usedIds.has(q.id) &&
            q.rating >= requiredRating - 2 &&
            (anchorLeagues.has(q.league) || anchorNations.has(q.nation)),
        )
        .sort(byPrice)
        .slice(0, 250);
      const swap = bestSwap(
        candidates,
        (next) => chemOf(next) - base,
        base,
        (next) => ratingOf(next) >= requiredRating,
      );
      if (!swap) break;
      applySwap(swap.i, swap.q);
    }
  }

  // --- 5. Final assignment + evaluation ---
  const squad = assignToFormation(selected, formationName);
  const check = evaluateSquadConstraints(squad.slots, c);
  const cost = selected.reduce((sum, p) => sum + eff(p), 0);

  return {
    ok: check.ok,
    squad,
    rating: check.rating,
    chemistry: check.chemistry,
    cost,
    failures: check.failures,
    truncated,
  };
}
