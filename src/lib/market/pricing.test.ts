import { describe, it, expect } from "vitest";
import { priceHistory, trendPct, signalFromTrend, valueScore } from "./pricing";

describe("priceHistory", () => {
  it("is deterministic for a given player id", () => {
    const a = priceHistory({ id: 42, price: 5000 });
    const b = priceHistory({ id: 42, price: 5000 });
    expect(a).toEqual(b);
  });
  it("has the requested length and ends at the current price", () => {
    const h = priceHistory({ id: 7, price: 8000 }, 30);
    expect(h).toHaveLength(30);
    expect(h[h.length - 1]).toBe(8000);
    expect(Math.min(...h)).toBeGreaterThanOrEqual(150);
  });
});

describe("trendPct", () => {
  it("is positive for a rising series and negative for a falling one", () => {
    expect(trendPct([100, 110, 120])).toBeGreaterThan(0);
    expect(trendPct([120, 110, 100])).toBeLessThan(0);
  });
});

describe("signalFromTrend", () => {
  it("maps trend to buy/sell/hold", () => {
    expect(signalFromTrend(-6)).toBe("buy");
    expect(signalFromTrend(8)).toBe("sell");
    expect(signalFromTrend(0)).toBe("hold");
  });
});

describe("valueScore", () => {
  it("rates a cheaper player higher and a better rating higher", () => {
    expect(valueScore({ rating: 84, price: 1000 })).toBeGreaterThan(valueScore({ rating: 84, price: 50000 }));
    expect(valueScore({ rating: 88, price: 5000 })).toBeGreaterThan(valueScore({ rating: 82, price: 5000 }));
  });
});
