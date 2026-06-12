import { describe, it, expect } from "vitest";
import { calcChemistry } from "./chemistry";
import type { Player, Position, SquadSlot } from "./types";

let nextId = 1;
function mk(over: Partial<Player> = {}): Player {
  return {
    id: nextId++,
    name: "P",
    rating: 80,
    positions: ["ST"],
    league: "L",
    leagueId: 1,
    nation: "N",
    nationId: 1,
    club: "C",
    clubId: 1,
    pace: 80,
    shooting: 80,
    passing: 80,
    dribbling: 80,
    defending: 80,
    physical: 80,
    skillMoves: 3,
    weakFoot: 3,
    foot: "R",
    age: 25,
    rarity: "gold",
    price: 0,
    ...over,
  };
}

/** Put each player in its primary position (in-position) unless pos given. */
function slot(player: Player | null, position?: Position): SquadSlot {
  return { position: position ?? player?.positions[0] ?? "ST", player };
}

describe("calcChemistry", () => {
  it("is 0 for an empty squad", () => {
    const slots = Array.from({ length: 11 }, () => slot(null));
    expect(calcChemistry(slots).total).toBe(0);
  });

  it("gives full 33 when all 11 share club, league and nation in position", () => {
    const slots = Array.from({ length: 11 }, () =>
      slot(mk({ clubId: 1, leagueId: 1, nationId: 1 })),
    );
    const res = calcChemistry(slots);
    expect(res.total).toBe(33);
    expect(res.perPlayer.every((c) => c === 3)).toBe(true);
  });

  it("awards 1 league point when exactly 3 share a league", () => {
    const leagueMates = Array.from({ length: 3 }, (_, i) =>
      slot(mk({ leagueId: 9, clubId: 100 + i, nationId: 200 + i })),
    );
    const loners = Array.from({ length: 8 }, (_, i) =>
      slot(mk({ leagueId: 300 + i, clubId: 400 + i, nationId: 500 + i })),
    );
    const res = calcChemistry([...leagueMates, ...loners]);
    expect(res.total).toBe(3); // 3 mates * 1, loners 0
  });

  it("awards 1 nation point to a same-nation pair", () => {
    const pair = Array.from({ length: 2 }, (_, i) =>
      slot(mk({ nationId: 7, clubId: 10 + i, leagueId: 20 + i })),
    );
    const loners = Array.from({ length: 9 }, (_, i) =>
      slot(mk({ nationId: 30 + i, clubId: 40 + i, leagueId: 50 + i })),
    );
    expect(calcChemistry([...pair, ...loners]).total).toBe(2);
  });

  it("gives no chemistry to an out-of-position player and breaks its links", () => {
    const a = mk({ nationId: 7, positions: ["ST"] });
    const b = mk({ nationId: 7, positions: ["CB"] });
    // b is placed at ST (out of position) -> contributes nothing, gets nothing
    const slots: SquadSlot[] = [slot(a, "ST"), slot(b, "ST")];
    for (let i = 0; i < 9; i++)
      slots.push(slot(mk({ nationId: 60 + i, clubId: 70 + i, leagueId: 80 + i })));
    const res = calcChemistry(slots);
    expect(res.perPlayer[1]).toBe(0); // out of position
    expect(res.perPlayer[0]).toBe(0); // its only nation link was out of position
    expect(res.total).toBe(0);
  });

  it("caps each player at 3 even when club+league+nation all max out", () => {
    // 8 identical players: club(8>=7)=3, league(8>=8)=3, nation(8>=8)=3 -> cap 3
    const eight = Array.from({ length: 8 }, () =>
      slot(mk({ clubId: 1, leagueId: 1, nationId: 1 })),
    );
    const fillers = Array.from({ length: 3 }, (_, i) =>
      slot(mk({ clubId: 90 + i, leagueId: 91 + i, nationId: 92 + i })),
    );
    const res = calcChemistry([...eight, ...fillers]);
    expect(res.perPlayer.slice(0, 8).every((c) => c === 3)).toBe(true);
    expect(res.total).toBe(24);
  });
});
