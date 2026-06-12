import { describe, it, expect } from "vitest";
import { evaluateSquadConstraints } from "./sbc";
import type { Player, SquadSlot } from "./types";

let nextId = 1;
function mk(over: Partial<Player> = {}): Player {
  return {
    id: nextId++, name: "P", rating: 84, positions: ["ST"],
    league: "Premier League", leagueId: 1, nation: "England", nationId: 1,
    club: "Club", clubId: 1, pace: 80, shooting: 80, passing: 80,
    dribbling: 80, defending: 80, physical: 80, skillMoves: 3, weakFoot: 3,
    foot: "R", age: 25, rarity: "gold", price: 1000, ...over,
  };
}
function squad(players: Player[]): SquadSlot[] {
  return players.map((p) => ({ position: p.positions[0], player: p }));
}

describe("evaluateSquadConstraints", () => {
  it("passes a full squad that meets rating and chemistry", () => {
    const slots = squad(Array.from({ length: 11 }, () => mk({ rating: 84 })));
    const res = evaluateSquadConstraints(slots, {
      squadSize: 11,
      minRating: 84,
      minChemistry: 30,
    });
    expect(res.ok).toBe(true);
    expect(res.failures).toEqual([]);
  });

  it("fails when the squad is not full", () => {
    const slots = squad(Array.from({ length: 10 }, () => mk()));
    slots.push({ position: "ST", player: null });
    const res = evaluateSquadConstraints(slots, { squadSize: 11 });
    expect(res.ok).toBe(false);
  });

  it("fails when squad rating is below the minimum", () => {
    const slots = squad(Array.from({ length: 11 }, () => mk({ rating: 80 })));
    const res = evaluateSquadConstraints(slots, { squadSize: 11, minRating: 84 });
    expect(res.ok).toBe(false);
    expect(res.failures.join(" ")).toMatch(/rating/i);
  });

  it("enforces a minimum count from a specific nation", () => {
    const players = [
      ...Array.from({ length: 3 }, () => mk({ nation: "Brazil", nationId: 9 })),
      ...Array.from({ length: 8 }, (_, i) => mk({ nation: "X" + i, nationId: 100 + i })),
    ];
    const res = evaluateSquadConstraints(squad(players), {
      squadSize: 11,
      fromNation: { nation: "Brazil", count: 4 },
    });
    expect(res.ok).toBe(false); // only 3 of 4
    const res2 = evaluateSquadConstraints(squad(players), {
      squadSize: 11,
      fromNation: { nation: "Brazil", count: 3 },
    });
    expect(res2.ok).toBe(true);
  });

  it("enforces a minimum number of distinct leagues", () => {
    const players = Array.from({ length: 11 }, (_, i) =>
      mk({ league: "L" + (i % 4), leagueId: i % 4 }),
    );
    const res = evaluateSquadConstraints(squad(players), {
      squadSize: 11,
      minLeagues: 5,
    });
    expect(res.ok).toBe(false); // only 4 distinct
  });
});
