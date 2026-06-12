import { calcChemistry } from "./chemistry";
import { calcSquadRating } from "./rating";
import type { SlotView } from "./solve-types";

export interface SquadMetrics {
  rating: number;
  chemistry: number;
  chemPerPlayer: number[];
  cost: number;
  filled: number;
}

/** Client-safe live metrics for a squad of view slots (pure functions only). */
export function squadMetrics(slots: SlotView[]): SquadMetrics {
  const chem = calcChemistry(slots.map((s) => ({ position: s.position, player: s.player })));
  return {
    rating: calcSquadRating(slots.map((s) => s.player?.rating ?? 0)),
    chemistry: chem.total,
    chemPerPlayer: chem.perPlayer,
    cost: slots.reduce((sum, s) => sum + (s.player?.price ?? 0), 0),
    filled: slots.filter((s) => s.player).length,
  };
}
