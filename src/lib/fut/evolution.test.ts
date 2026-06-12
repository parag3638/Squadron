import { describe, it, expect } from "vitest";
import { isEligible, applyEvolution, rankCandidates, type Evolution } from "./evolution";
import type { Player } from "./types";

function mk(over: Partial<Player> & { rating: number }): Player {
  return {
    id: 1, name: "P", positions: ["ST"], league: "L", leagueId: 1, nation: "N", nationId: 1,
    club: "C", clubId: 1, pace: 80, shooting: 80, passing: 80, dribbling: 80, defending: 50,
    physical: 75, skillMoves: 3, weakFoot: 3, foot: "R", age: 22, rarity: "gold", price: 1000,
    ...over,
  };
}

const evo: Evolution = {
  id: "pace", name: "Pace Merchant", description: "", tag: "Free", cost: 0,
  requirements: { maxRating: 84, maxPace: 88, positions: ["ST", "LW", "RW"] },
  upgrades: { rating: 2, pace: 4, dribbling: 3, addPositions: ["CF"] },
};

describe("isEligible", () => {
  it("accepts a player at the rating ceiling and rejects above it", () => {
    expect(isEligible(mk({ rating: 84 }), evo)).toBe(true);
    expect(isEligible(mk({ rating: 85 }), evo)).toBe(false);
  });
  it("rejects players over the pace cap", () => {
    expect(isEligible(mk({ rating: 80, pace: 90 }), evo)).toBe(false);
  });
  it("requires a matching position", () => {
    expect(isEligible(mk({ rating: 80, positions: ["CB"] }), evo)).toBe(false);
    expect(isEligible(mk({ rating: 80, positions: ["LW"] }), evo)).toBe(true);
  });
});

describe("applyEvolution", () => {
  it("applies upgrades and caps stats at 99", () => {
    const after = applyEvolution(mk({ rating: 84, pace: 97 }), evo);
    expect(after.rating).toBe(86);
    expect(after.pace).toBe(99); // 97 + 4 capped
    expect(after.dribbling).toBe(83);
  });
  it("adds new positions without duplicating", () => {
    const after = applyEvolution(mk({ rating: 80, positions: ["ST", "CF"] }), evo);
    expect(after.positions).toEqual(["ST", "CF"]);
  });
});

describe("rankCandidates", () => {
  it("returns eligible players ordered by upgraded rating", () => {
    const players = [
      mk({ id: 1, rating: 80, positions: ["ST"] }),
      mk({ id: 2, rating: 84, positions: ["ST"] }),
      mk({ id: 3, rating: 88, positions: ["ST"] }), // ineligible (>84)
      mk({ id: 4, rating: 82, positions: ["CB"] }), // ineligible (position)
    ];
    const ranked = rankCandidates(evo, players);
    expect(ranked.map((r) => r.player.id)).toEqual([2, 1]);
    expect(ranked[0].after.rating).toBe(86);
  });
});
