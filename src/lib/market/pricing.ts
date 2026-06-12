/**
 * Price dynamics. The bundled dataset has no live market, so price *history* is
 * a deterministic synthetic model (seeded by player id) — clearly labelled
 * "estimated" in the UI and swappable for a real FutDB time-series later. The
 * value/trend/signal helpers are pure and client-safe.
 */

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A deterministic ~30-day price series ending at the player's current price. */
export function priceHistory(p: { id: number; price: number }, days = 30): number[] {
  const rng = mulberry32(p.id);
  const phase = rng() * Math.PI * 2;
  const trend = (rng() - 0.5) * 0.3; // overall drift over the window, ±15%
  const series: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    const cyclic = Math.sin(t * 4 * Math.PI + phase) * 0.05;
    const noise = (rng() - 0.5) * 0.03;
    const factor = 1 + trend * (t - 1) + cyclic + noise;
    series.push(Math.max(150, Math.round((p.price * factor) / 50) * 50));
  }
  series[days - 1] = p.price; // anchor "today" to the known price
  return series;
}

export function trendPct(history: number[]): number {
  if (history.length < 2) return 0;
  const first = history[0];
  const last = history[history.length - 1];
  return first === 0 ? 0 : ((last - first) / first) * 100;
}

export type Signal = "buy" | "sell" | "hold";

export function signalFromTrend(pct: number): Signal {
  if (pct <= -3) return "buy";
  if (pct >= 4) return "sell";
  return "hold";
}

/** A 0–100 value score — high rating for low coins scores best. */
export function valueScore(p: { rating: number; price: number }): number {
  const raw = p.rating - 8 * Math.log10(Math.max(p.price, 200));
  return Math.max(0, Math.min(100, Math.round(raw + 20)));
}

export function signalForPlayer(p: { id: number; price: number }): Signal {
  return signalFromTrend(trendPct(priceHistory(p)));
}

/** Derived market fields for a player — usable on both server and client. */
export function marketFields(p: { id: number; price: number; rating: number }) {
  const history = priceHistory(p);
  const tp = Math.round(trendPct(history) * 10) / 10;
  return {
    value: valueScore(p),
    trendPct: tp,
    signal: signalFromTrend(tp),
    history,
  };
}
