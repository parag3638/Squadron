import type { Position, Rarity } from "./types";

/** Compact, serialisable views shared by the solver service, API and UI. */
export interface SlotView {
  position: Position;
  player: {
    id: number;
    name: string;
    rating: number;
    positions: Position[];
    club: string;
    clubId: number;
    league: string;
    leagueId: number;
    nation: string;
    nationId: number;
    rarity: Rarity;
    price: number;
    owned?: boolean;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  } | null;
}

export interface ShapedSolve {
  ok: boolean;
  rating: number;
  chemistry: number;
  cost: number;
  truncated: boolean;
  formation: string;
  failures: string[];
  slots: SlotView[];
  /** Coins saved by using owned players (their market value). */
  savings?: number;
  /** How many of the XI came from the user's club. */
  ownedUsed?: number;
}
