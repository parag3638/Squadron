import { describe, it, expect } from "vitest";
import { calcSquadRating } from "./rating";

describe("calcSquadRating", () => {
  it("returns the common rating when all 11 players are equal", () => {
    const ratings = Array(11).fill(80);
    expect(calcSquadRating(ratings)).toBe(80);
  });

  it("applies the above-average excess bonus (EA formula)", () => {
    // nine 82s + two 92s: sum=922, avg=83.818, excess=2*(92-avg)=16.36
    // (922 + 16.36) / 11 = 85.30 -> floor 85, above the plain average of 83.8
    const ratings = [82, 82, 82, 82, 82, 82, 82, 82, 82, 92, 92];
    expect(calcSquadRating(ratings)).toBe(85);
  });

  it("floors the result", () => {
    // ten 75s + one 99: sum=849, avg=77.18, excess=21.82
    // (849 + 21.82) / 11 = 79.16 -> floor 79
    const ratings = [75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 99];
    expect(calcSquadRating(ratings)).toBe(79);
  });

  it("treats empty slots as 0 and still divides by squad size", () => {
    // ten 84s + one empty(0): sum=840, avg=76.36, excess=10*(84-76.36)=76.36
    // (840 + 76.36)/11 = 83.30 -> floor 83
    const ratings = [84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 0];
    expect(calcSquadRating(ratings)).toBe(83);
  });

  it("returns 0 for an all-empty squad", () => {
    expect(calcSquadRating(Array(11).fill(0))).toBe(0);
  });
});
