/**
 * Optional FutDB (futdatabase.com) client for live FC26 prices/SBCs.
 *
 * Enabled only when FUTDB_API_KEY is set. Everything degrades gracefully to the
 * bundled dataset + estimated prices when it isn't, so the app is fully usable
 * with zero external services. This is the seam where Phase 3 (trading) plugs in.
 */
const BASE = "https://futdb.app/api";

export function isFutdbConfigured(): boolean {
  return Boolean(process.env.FUTDB_API_KEY);
}

async function futdb<T>(pathname: string): Promise<T | null> {
  const key = process.env.FUTDB_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}${pathname}`, {
      headers: { "X-AUTH-TOKEN": key, Accept: "application/json" },
      next: { revalidate: 60 * 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Live price in coins for a player id, or null when unavailable. */
export async function getLivePrice(playerId: number): Promise<number | null> {
  const data = await futdb<{ price?: { pc?: number } }>(`/players/${playerId}/price`);
  return data?.price?.pc ?? null;
}
