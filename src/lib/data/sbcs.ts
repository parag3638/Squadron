/**
 * Bundled sample SBCs. Real SBCs rotate constantly and come from FutDB when a
 * key is configured; these mirror the shape and difficulty of typical FC26
 * challenges so the solver and UI are fully exercised out of the box.
 */
import type { SbcConstraints } from "@/lib/fut/sbc";

export interface Sbc {
  id: string;
  name: string;
  group: "Foundations" | "Upgrades" | "Leagues" | "Nations" | "Marquee";
  description: string;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  repeatable: boolean;
  constraints: SbcConstraints;
}

export const SBCS: Sbc[] = [
  {
    id: "gold-upgrade",
    name: "Gold Upgrade",
    group: "Foundations",
    description: "Submit 11 gold players to earn a pack. The cheapest way to start.",
    reward: "Small Gold Players Pack",
    difficulty: "easy",
    repeatable: true,
    constraints: { squadSize: 11, minGoldPlayers: 11 },
  },
  {
    id: "83-rated",
    name: "83-Rated Squad",
    group: "Upgrades",
    description: "An 83-rated squad with solid links — reliable pack value.",
    reward: "Premium Gold Pack",
    difficulty: "easy",
    repeatable: true,
    constraints: { squadSize: 11, minRating: 83, minChemistry: 20 },
  },
  {
    id: "85-rated",
    name: "85-Rated Squad",
    group: "Upgrades",
    description: "A step up — 85 rating with decent chemistry.",
    reward: "Jumbo Premium Gold Pack",
    difficulty: "medium",
    repeatable: true,
    constraints: { squadSize: 11, minRating: 85, minChemistry: 18 },
  },
  {
    id: "premier-league",
    name: "Premier League",
    group: "Leagues",
    description: "Build around the Premier League — at least 4 from the division.",
    reward: "Rare Mixed Players Pack",
    difficulty: "medium",
    repeatable: false,
    constraints: {
      squadSize: 11,
      minRating: 83,
      minChemistry: 24,
      fromLeague: { league: "Premier League", count: 4 },
    },
  },
  {
    id: "samba-stars",
    name: "Samba Stars",
    group: "Nations",
    description: "Celebrate Brazilian flair — at least 4 Brazilians, 84 rated.",
    reward: "Rare Players Pack",
    difficulty: "medium",
    repeatable: false,
    constraints: {
      squadSize: 11,
      minRating: 84,
      minChemistry: 22,
      fromNation: { nation: "Brazil", count: 4 },
    },
  },
  {
    id: "hybrid-nations",
    name: "Hybrid Nations",
    group: "Foundations",
    description: "Spread across the globe — 5+ leagues and 5+ nations.",
    reward: "Mixed Players Pack",
    difficulty: "medium",
    repeatable: true,
    constraints: {
      squadSize: 11,
      minRating: 82,
      minChemistry: 25,
      minLeagues: 5,
      minNations: 5,
    },
  },
  {
    id: "marquee-matchups",
    name: "Marquee Matchups",
    group: "Marquee",
    description: "A premium 86-rated side featuring at least one elite 87+ player.",
    reward: "Prime Gold Players Pack",
    difficulty: "hard",
    repeatable: false,
    constraints: {
      squadSize: 11,
      minRating: 86,
      minChemistry: 15,
      minPlayersRated: { rating: 87, count: 1 },
    },
  },
];

export function getSbcs(): Sbc[] {
  return SBCS;
}

export function getSbcById(id: string): Sbc | undefined {
  return SBCS.find((s) => s.id === id);
}
