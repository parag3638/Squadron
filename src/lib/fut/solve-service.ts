/**
 * Server-side solve orchestration shared by the API routes and the AI tools:
 * build a pool from the dataset, run the solver, and shape the result into a
 * compact, serialisable payload the UI (pitch) and the model both consume.
 */
import { getSolverPool, getPlayersByIds, type PlayerFilter } from "@/lib/data/players";
import { getSbcById, type Sbc } from "@/lib/data/sbcs";
import { solveSbc, type SolveResult } from "./solver";
import type { SbcConstraints } from "./sbc";
import type { Player } from "./types";
import type { ShapedSolve } from "./solve-types";

export type { ShapedSolve, SlotView } from "./solve-types";

export function shapeResult(result: SolveResult): ShapedSolve {
  return {
    ok: result.ok,
    rating: result.rating,
    chemistry: result.chemistry,
    cost: result.cost,
    truncated: result.truncated,
    formation: result.squad.formation,
    failures: result.failures,
    slots: result.squad.slots.map((s) => ({
      position: s.position,
      player: s.player
        ? {
            id: s.player.id,
            name: s.player.name,
            rating: s.player.rating,
            positions: s.player.positions,
            club: s.player.club,
            clubId: s.player.clubId,
            league: s.player.league,
            leagueId: s.player.leagueId,
            nation: s.player.nation,
            nationId: s.player.nationId,
            rarity: s.player.rarity,
            price: s.player.price,
            owned: s.player.owned,
            pace: s.player.pace,
            shooting: s.player.shooting,
            passing: s.player.passing,
            dribbling: s.player.dribbling,
            defending: s.player.defending,
            physical: s.player.physical,
          }
        : null,
    })),
  };
}

export interface BuildOptions {
  formation?: string;
  baseFilter?: PlayerFilter;
  /** Player ids in the user's club — injected at 0 cost so the solver prefers them. */
  ownedIds?: number[];
}

/** Merge the user's owned players (marked free) into a candidate pool. */
function withClub(pool: Player[], ownedIds?: number[]): Player[] {
  if (!ownedIds?.length) return pool;
  const ownedSet = new Set(ownedIds);
  const owned = getPlayersByIds(ownedIds).map((p) => ({ ...p, owned: true }));
  const rest = pool.filter((p) => !ownedSet.has(p.id));
  return [...owned, ...rest];
}

export function solveForConstraints(c: SbcConstraints, opts: BuildOptions = {}): ShapedSolve {
  const pool = withClub(getSolverPool(c, opts.baseFilter), opts.ownedIds);
  const shaped = shapeResult(solveSbc({ pool, constraints: c, formation: opts.formation }));

  if (opts.ownedIds?.length) {
    const usedOwned = shaped.slots.filter((s) => s.player?.owned);
    shaped.ownedUsed = usedOwned.length;
    shaped.savings = usedOwned.reduce((sum, s) => sum + (s.player?.price ?? 0), 0);
  }
  return shaped;
}

export function solveSbcById(
  id: string,
  formation?: string,
  ownedIds?: number[],
): { sbc: Sbc; result: ShapedSolve } | null {
  const sbc = getSbcById(id);
  if (!sbc) return null;
  return { sbc, result: solveForConstraints(sbc.constraints, { formation, ownedIds }) };
}
