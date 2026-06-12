import type { ChemistryResult, Player, Position } from "./types";

/** Minimal player shape chemistry needs — so view-layer types work too. */
export type ChemPlayer = Pick<Player, "clubId" | "leagueId" | "nationId" | "positions" | "rarity">;
export interface ChemSlot {
  position: Position;
  player: ChemPlayer | null;
}

/**
 * EA Sports FC (FC24+) chemistry system.
 *
 * Each player earns 0–3 chemistry points, but ONLY when played in one of their
 * positions. An out-of-position (or empty) slot earns 0 and contributes nothing
 * to teammates' links. Points come from how many in-position teammates share the
 * player's club, league, and nation (counting the player themselves), via fixed
 * thresholds, summed and capped at 3. Team chemistry = sum of per-player chem,
 * max 33.
 *
 * Icons and Heroes always have full chemistry when in position; an Icon counts
 * double toward nation links and a Hero counts double toward its league.
 */

// [threshold, points] ordered high → low; first met wins.
const CLUB = [
  [7, 3],
  [4, 2],
  [2, 1],
] as const;
const LEAGUE = [
  [8, 3],
  [5, 2],
  [3, 1],
] as const;
const NATION = [
  [8, 3],
  [5, 2],
  [2, 1],
] as const;

function pointsFor(count: number, table: readonly (readonly [number, number])[]): number {
  for (const [threshold, pts] of table) {
    if (count >= threshold) return pts;
  }
  return 0;
}

function inPosition(slot: ChemSlot): slot is ChemSlot & { player: ChemPlayer } {
  return slot.player !== null && slot.player.positions.includes(slot.position);
}

export function calcChemistry(slots: ChemSlot[]): ChemistryResult {
  const active = slots.map(inPosition);

  // Weighted contribution counts per dimension (Icon = 2 nation, Hero = 2 league).
  const clubCount = new Map<number, number>();
  const leagueCount = new Map<number, number>();
  const nationCount = new Map<number, number>();

  slots.forEach((slot, i) => {
    if (!active[i]) return;
    const p = slot.player!;
    clubCount.set(p.clubId, (clubCount.get(p.clubId) ?? 0) + 1);
    leagueCount.set(
      p.leagueId,
      (leagueCount.get(p.leagueId) ?? 0) + (p.rarity === "hero" ? 2 : 1),
    );
    nationCount.set(
      p.nationId,
      (nationCount.get(p.nationId) ?? 0) + (p.rarity === "icon" ? 2 : 1),
    );
  });

  const perPlayer = slots.map((slot, i) => {
    if (!active[i]) return 0;
    const p = slot.player!;
    if (p.rarity === "icon" || p.rarity === "hero") return 3;

    const pts =
      pointsFor(clubCount.get(p.clubId) ?? 0, CLUB) +
      pointsFor(leagueCount.get(p.leagueId) ?? 0, LEAGUE) +
      pointsFor(nationCount.get(p.nationId) ?? 0, NATION);

    return Math.min(3, pts);
  });

  return { total: perPlayer.reduce((a, b) => a + b, 0), perPlayer };
}
