import type { Player, Position, Rarity } from "./types";

/**
 * Evolutions — upgrade an eligible low-rated player into a stronger card.
 * Pure, deterministic logic; the dataset lives in src/lib/data/evolutions.ts.
 */
export interface EvolutionRequirements {
  maxRating?: number;
  minRating?: number;
  maxPace?: number;
  maxShooting?: number;
  maxPassing?: number;
  maxDribbling?: number;
  maxDefending?: number;
  maxPhysical?: number;
  maxSkillMoves?: number;
  maxWeakFoot?: number;
  positions?: Position[];
  rarities?: Rarity[];
}

export interface EvolutionUpgrade {
  rating?: number;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physical?: number;
  skillMoves?: number;
  weakFoot?: number;
  addPositions?: Position[];
}

export interface Evolution {
  id: string;
  name: string;
  description: string;
  tag: string;
  /** Cost in coins; 0 = free. */
  cost: number;
  requirements: EvolutionRequirements;
  upgrades: EvolutionUpgrade;
}

export function isEligible(p: Player, e: Evolution): boolean {
  const r = e.requirements;
  if (r.maxRating != null && p.rating > r.maxRating) return false;
  if (r.minRating != null && p.rating < r.minRating) return false;
  if (r.maxPace != null && p.pace > r.maxPace) return false;
  if (r.maxShooting != null && p.shooting > r.maxShooting) return false;
  if (r.maxPassing != null && p.passing > r.maxPassing) return false;
  if (r.maxDribbling != null && p.dribbling > r.maxDribbling) return false;
  if (r.maxDefending != null && p.defending > r.maxDefending) return false;
  if (r.maxPhysical != null && p.physical > r.maxPhysical) return false;
  if (r.maxSkillMoves != null && p.skillMoves > r.maxSkillMoves) return false;
  if (r.maxWeakFoot != null && p.weakFoot > r.maxWeakFoot) return false;
  if (r.positions && !p.positions.some((pos) => r.positions!.includes(pos))) return false;
  if (r.rarities && !r.rarities.includes(p.rarity)) return false;
  return true;
}

const cap = (n: number, max = 99) => Math.min(max, n);

export function applyEvolution(p: Player, e: Evolution): Player {
  const u = e.upgrades;
  return {
    ...p,
    rating: u.rating ? cap(p.rating + u.rating) : p.rating,
    pace: u.pace ? cap(p.pace + u.pace) : p.pace,
    shooting: u.shooting ? cap(p.shooting + u.shooting) : p.shooting,
    passing: u.passing ? cap(p.passing + u.passing) : p.passing,
    dribbling: u.dribbling ? cap(p.dribbling + u.dribbling) : p.dribbling,
    defending: u.defending ? cap(p.defending + u.defending) : p.defending,
    physical: u.physical ? cap(p.physical + u.physical) : p.physical,
    skillMoves: u.skillMoves ? cap(p.skillMoves + u.skillMoves, 5) : p.skillMoves,
    weakFoot: u.weakFoot ? cap(p.weakFoot + u.weakFoot, 5) : p.weakFoot,
    positions: u.addPositions
      ? [...new Set([...p.positions, ...u.addPositions])]
      : p.positions,
  };
}

export function evolutionRatingGain(p: Player, e: Evolution): number {
  return applyEvolution(p, e).rating - p.rating;
}

export interface EvoCandidate {
  player: Player;
  after: Player;
}

export function rankCandidates(e: Evolution, players: Player[], limit = 12): EvoCandidate[] {
  return players
    .filter((p) => isEligible(p, e))
    .map((p) => ({ player: p, after: applyEvolution(p, e) }))
    .sort((a, b) => b.after.rating - a.after.rating || b.player.rating - a.player.rating)
    .slice(0, limit);
}
