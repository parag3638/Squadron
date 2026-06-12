import type { Rarity } from "./types";

const FLOOR = 150;

/**
 * Base-card rarity from an overall rating. The bundled dataset is base ratings
 * (no special items), so rarity is derived: bronze < 65 ≤ silver < 75 ≤ gold.
 * FutDB-sourced specials/icons keep their own rarity.
 */
export function rarityFromRating(rating: number): Rarity {
  if (rating >= 75) return "gold";
  if (rating >= 65) return "silver";
  return "bronze";
}

/**
 * Estimated transfer-market price in coins. This is a deterministic model
 * (not a live quote) shaped to resemble the real FUT price curve — cheap up to
 * ~83, then climbing steeply. Used as the solver's cost function and clearly
 * labelled as an estimate in the UI; replaceable by live FutDB prices.
 */
export function estimatePrice(rating: number, rarity: Rarity = "gold"): number {
  let base: number;
  if (rating < 65) {
    base = FLOOR + (rating - 40) * 8; // bronze: ~150–350
  } else if (rating < 75) {
    base = 250 + (rating - 65) * 45; // silver / low gold: ~250–700
  } else {
    base = 700 * Math.exp(0.33 * (rating - 75)); // gold curve
  }

  if (rarity === "special") base *= 1.6;
  if (rarity === "icon" || rarity === "hero") base *= 2.2;

  return Math.max(FLOOR, Math.round(base / 50) * 50);
}
