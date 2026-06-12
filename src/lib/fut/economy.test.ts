import { describe, it, expect } from "vitest";
import { rarityFromRating, estimatePrice } from "./economy";

describe("rarityFromRating", () => {
  it("maps rating bands to bronze/silver/gold", () => {
    expect(rarityFromRating(58)).toBe("bronze");
    expect(rarityFromRating(64)).toBe("bronze");
    expect(rarityFromRating(65)).toBe("silver");
    expect(rarityFromRating(74)).toBe("silver");
    expect(rarityFromRating(75)).toBe("gold");
    expect(rarityFromRating(91)).toBe("gold");
  });
});

describe("estimatePrice", () => {
  it("increases with rating", () => {
    expect(estimatePrice(84, "gold")).toBeGreaterThan(estimatePrice(80, "gold"));
    expect(estimatePrice(90, "gold")).toBeGreaterThan(estimatePrice(86, "gold"));
  });

  it("never goes below the market floor", () => {
    expect(estimatePrice(50, "bronze")).toBeGreaterThanOrEqual(150);
  });

  it("prices specials above an equivalent gold", () => {
    expect(estimatePrice(86, "special")).toBeGreaterThan(estimatePrice(86, "gold"));
  });
});
