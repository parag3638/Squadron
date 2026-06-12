/**
 * Core FUT domain types. These are shared by the solver, the chemistry/rating
 * engines, the data layer, and the UI (the pitch reuses the same logic
 * isomorphically on the client).
 */

export type Position =
  | "GK"
  | "RB"
  | "LB"
  | "CB"
  | "RWB"
  | "LWB"
  | "CDM"
  | "CM"
  | "CAM"
  | "RM"
  | "LM"
  | "RW"
  | "LW"
  | "CF"
  | "ST";

export type Rarity = "bronze" | "silver" | "gold" | "special" | "icon" | "hero";

export interface Player {
  id: number;
  name: string;
  fullName?: string;
  rating: number;
  /** Playable positions; index 0 is the player's primary position. */
  positions: Position[];
  league: string;
  leagueId: number;
  nation: string;
  nationId: number;
  club: string;
  clubId: number;
  /** Face stats (pace, shooting, passing, dribbling, defending, physical). */
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  skillMoves: number; // 1-5
  weakFoot: number; // 1-5
  foot: "L" | "R";
  age: number;
  rarity: Rarity;
  /** Estimated transfer-market price in coins (see data layer for sourcing). */
  price: number;
  /** True when the player is in the user's club — costs 0 coins to use in a solve. */
  owned?: boolean;
}

/** One slot of a formation, optionally filled with a player. */
export interface SquadSlot {
  /** The formation position this slot represents. */
  position: Position;
  player: Player | null;
}

export interface Squad {
  formation: string;
  slots: SquadSlot[];
}

export interface ChemistryResult {
  /** Team chemistry, 0–33. */
  total: number;
  /** Per-slot chemistry, 0–3 (0 for empty or out-of-position). */
  perPlayer: number[];
}
