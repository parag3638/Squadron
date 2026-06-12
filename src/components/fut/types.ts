import type { Position, Rarity } from "@/lib/fut/types";

/** The fields the card / pitch UI needs — satisfied by both the full Player and API/solve payloads. */
export interface PlayerView {
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
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physical?: number;
  skillMoves?: number;
  weakFoot?: number;
  foot?: "L" | "R";
  age?: number;
}
