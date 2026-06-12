import type { Evolution } from "@/lib/fut/evolution";

/**
 * Sample Evolutions modelled on the FC26 style — eligibility caps + stat/position
 * upgrades. Real Evos rotate; these exercise the planner end to end.
 */
export const EVOLUTIONS: Evolution[] = [
  {
    id: "pace-merchant",
    name: "Pace Merchant",
    description: "Turn a quick forward into a meta speedster.",
    tag: "Free",
    cost: 0,
    requirements: { maxRating: 83, maxPace: 90, positions: ["ST", "LW", "RW", "CF"] },
    upgrades: { rating: 2, pace: 4, dribbling: 3, skillMoves: 1 },
  },
  {
    id: "winger-wizard",
    name: "Winger Wizard",
    description: "A tricky wide man with a wand of a left (or right) foot.",
    tag: "Popular",
    cost: 50000,
    requirements: { maxRating: 84, positions: ["LW", "RW", "LM", "RM"] },
    upgrades: { rating: 2, pace: 3, dribbling: 4, passing: 2, weakFoot: 1, addPositions: ["CAM"] },
  },
  {
    id: "midfield-maestro",
    name: "Midfield Maestro",
    description: "Build a complete box-to-box engine.",
    tag: "Meta",
    cost: 75000,
    requirements: { maxRating: 84, positions: ["CM", "CAM", "CDM"] },
    upgrades: { rating: 3, passing: 4, dribbling: 3, physical: 2, skillMoves: 1 },
  },
  {
    id: "defensive-rock",
    name: "Defensive Rock",
    description: "Forge an unbeatable wall at the back.",
    tag: "Free",
    cost: 0,
    requirements: { maxRating: 84, positions: ["CB", "RB", "LB", "RWB", "LWB"] },
    upgrades: { rating: 2, defending: 4, physical: 3, pace: 2 },
  },
  {
    id: "striker-surge",
    name: "Striker Surge",
    description: "A clinical, complete number nine.",
    tag: "Premium",
    cost: 120000,
    requirements: { maxRating: 85, positions: ["ST", "CF"] },
    upgrades: { rating: 3, shooting: 4, pace: 2, physical: 2, weakFoot: 1 },
  },
  {
    id: "keeper-king",
    name: "Keeper King",
    description: "Promote a shot-stopper into a wall between the sticks.",
    tag: "Free",
    cost: 0,
    requirements: { maxRating: 83, positions: ["GK"] },
    upgrades: { rating: 3, defending: 4, physical: 3 },
  },
];

export function getEvolutions(): Evolution[] {
  return EVOLUTIONS;
}

export function getEvolutionById(id: string): Evolution | undefined {
  return EVOLUTIONS.find((e) => e.id === id);
}
