import { describe, it, expect } from "vitest";
import { solveSbc } from "./solver";
import { estimatePrice } from "./economy";
import type { Player, Position } from "./types";

const ALL_POS: Position[] = [
  "GK", "RB", "LB", "CB", "RWB", "LWB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "CF", "ST",
];

let id = 1;
function make(n: number, over: Partial<Player> & { rating: number }): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: id++,
    name: `P${over.rating}-${i}`,
    positions: over.positions ?? ALL_POS,
    league: over.league ?? `L${i}`,
    leagueId: over.leagueId ?? 1000 + i,
    nation: over.nation ?? `N${i}`,
    nationId: over.nationId ?? 2000 + i,
    club: over.club ?? `C${i}`,
    clubId: over.clubId ?? 3000 + i,
    pace: 80, shooting: 80, passing: 80, dribbling: 80, defending: 80, physical: 80,
    skillMoves: 3, weakFoot: 3, foot: "R", age: 25, rarity: "gold",
    price: over.price ?? estimatePrice(over.rating),
    ...over,
  }));
}

describe("solveSbc", () => {
  it("solves a simple rating target with a valid 11-player squad", () => {
    const pool = make(20, { rating: 84 });
    const res = solveSbc({ pool, constraints: { squadSize: 11, minRating: 84 } });
    expect(res.ok).toBe(true);
    expect(res.squad.slots.filter((s) => s.player).length).toBe(11);
    expect(res.rating).toBeGreaterThanOrEqual(84);
    expect(res.cost).toBeGreaterThan(0);
  });

  it("mixes cheap and expensive players to reach a higher rating", () => {
    const pool = [...make(30, { rating: 80 }), ...make(5, { rating: 90 })];
    const res = solveSbc({ pool, constraints: { squadSize: 11, minRating: 84 } });
    expect(res.ok).toBe(true);
    expect(res.rating).toBeGreaterThanOrEqual(84);
  });

  it("respects a from-nation constraint", () => {
    const pool = [
      ...make(4, { rating: 84, nation: "Brazil", nationId: 54 }),
      ...make(20, { rating: 84 }),
    ];
    const res = solveSbc({
      pool,
      constraints: { squadSize: 11, minRating: 84, fromNation: { nation: "Brazil", count: 4 } },
    });
    expect(res.ok).toBe(true);
    const brazilians = res.squad.slots.filter((s) => s.player?.nation === "Brazil").length;
    expect(brazilians).toBeGreaterThanOrEqual(4);
  });

  it("achieves high chemistry when the pool shares club/league/nation", () => {
    const pool = make(20, {
      rating: 84, league: "La Liga", leagueId: 53, nation: "Spain", nationId: 45, club: "X", clubId: 7,
    });
    const res = solveSbc({ pool, constraints: { squadSize: 11, minRating: 84, minChemistry: 30 } });
    expect(res.ok).toBe(true);
    expect(res.chemistry).toBeGreaterThanOrEqual(30);
  });

  it("reports failure (without throwing) when the SBC is infeasible", () => {
    const pool = make(20, { rating: 80 });
    const res = solveSbc({ pool, constraints: { squadSize: 11, minRating: 90 } });
    expect(res.ok).toBe(false);
    expect(res.failures.length).toBeGreaterThan(0);
  });

  it("prefers a cheaper solution over an expensive one", () => {
    const cheap = make(15, { rating: 84, price: 1000 });
    const pricey = make(15, { rating: 84, price: 50000 });
    const res = solveSbc({ pool: [...pricey, ...cheap], constraints: { squadSize: 11, minRating: 84 } });
    expect(res.ok).toBe(true);
    // Should lean on the 1000-coin players, not the 50k ones.
    expect(res.cost).toBeLessThan(11 * 50000);
  });

  it("treats owned players as free and prefers them", () => {
    // owned 84s are pricey on the market but cost 0 to use; non-owned are cheap.
    const owned = make(11, { rating: 84, price: 50000, owned: true });
    const market = make(11, { rating: 84, price: 1000 });
    const res = solveSbc({ pool: [...market, ...owned], constraints: { squadSize: 11, minRating: 84 } });
    expect(res.ok).toBe(true);
    expect(res.cost).toBe(0); // all 11 filled from the club
    expect(res.squad.slots.every((s) => s.player?.owned)).toBe(true);
  });
});
