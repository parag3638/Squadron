/**
 * Player repository. Backed by the bundled dataset + an in-memory index (v1).
 * The interface is intentionally storage-agnostic so it can be swapped for a
 * Postgres/Drizzle implementation later (see roadmap) without touching callers.
 *
 * Server-only: only import this from server components, API routes, or the AI
 * tool layer — never from a client component.
 */
import playersData from "@/data/players.json";
import type { Player, Position, Rarity } from "@/lib/fut/types";
import type { SbcConstraints } from "@/lib/fut/sbc";

const ALL = playersData as unknown as Player[];
const BY_ID = new Map<number, Player>(ALL.map((p) => [p.id, p]));

export type PlayerSort = "rating" | "price" | "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical";

export interface PlayerFilter {
  query?: string;
  position?: Position;
  league?: string;
  nation?: string;
  club?: string;
  minRating?: number;
  maxRating?: number;
  maxPrice?: number;
  rarity?: Rarity;
  sort?: PlayerSort;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

function matches(p: Player, f: PlayerFilter): boolean {
  if (f.position && !p.positions.includes(f.position)) return false;
  if (f.league && p.league !== f.league) return false;
  if (f.nation && p.nation !== f.nation) return false;
  if (f.club && p.club !== f.club) return false;
  if (f.rarity && p.rarity !== f.rarity) return false;
  if (f.minRating != null && p.rating < f.minRating) return false;
  if (f.maxRating != null && p.rating > f.maxRating) return false;
  if (f.maxPrice != null && p.price > f.maxPrice) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    if (!p.name.toLowerCase().includes(q) && !(p.fullName ?? "").toLowerCase().includes(q))
      return false;
  }
  return true;
}

function sortPlayers(items: Player[], sort: PlayerSort = "rating", order: "asc" | "desc" = "desc"): Player[] {
  const dir = order === "asc" ? 1 : -1;
  return [...items].sort((a, b) => (a[sort] - b[sort]) * dir);
}

export function searchPlayers(filter: PlayerFilter = {}): { items: Player[]; total: number } {
  const filtered = ALL.filter((p) => matches(p, filter));
  const sorted = sortPlayers(filtered, filter.sort, filter.order);
  const offset = filter.offset ?? 0;
  const limit = filter.limit ?? 50;
  return { items: sorted.slice(offset, offset + limit), total: filtered.length };
}

export function getPlayerById(id: number): Player | undefined {
  return BY_ID.get(id);
}

export function getPlayersByIds(ids: number[]): Player[] {
  return ids.map((id) => BY_ID.get(id)).filter((p): p is Player => p != null);
}

/** Cheapest `perRating` players at each distinct rating value. */
function stratifyCheapest(list: Player[], perRating: number): Player[] {
  const sorted = [...list].sort((a, b) => a.price - b.price || a.id - b.id);
  const count = new Map<number, number>();
  const out: Player[] = [];
  for (const p of sorted) {
    const n = count.get(p.rating) ?? 0;
    if (n < perRating) {
      out.push(p);
      count.set(p.rating, n + 1);
    }
  }
  return out;
}

/**
 * Build a candidate pool for the solver. Crucially this is *rating-stratified*
 * — the cheapest handful at every rating tier — so the solver can reach a high
 * target rating with cheap high-rated anchors, not just the globally cheapest
 * (low-rated) players. League/nation coverage is added when a constraint needs it.
 */
export function getSolverPool(c: SbcConstraints, baseFilter: PlayerFilter = {}): Player[] {
  const base = ALL.filter((p) => matches(p, baseFilter));
  const map = new Map<number, Player>();
  for (const p of stratifyCheapest(base, 45)) map.set(p.id, p);
  if (c.fromNation) {
    for (const p of stratifyCheapest(base.filter((p) => p.nation === c.fromNation!.nation), 30))
      map.set(p.id, p);
  }
  if (c.fromLeague) {
    for (const p of stratifyCheapest(base.filter((p) => p.league === c.fromLeague!.league), 30))
      map.set(p.id, p);
  }
  return [...map.values()];
}

export function totalPlayers(): number {
  return ALL.length;
}

/** The full player list (server-only) — used by the Evolutions ranker. */
export function getAllPlayers(): Player[] {
  return ALL;
}
