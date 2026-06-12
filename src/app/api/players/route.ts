import { searchPlayers, getPlayersByIds, type PlayerSort } from "@/lib/data/players";
import type { Position, Rarity } from "@/lib/fut/types";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const numberOr = (key: string) => (sp.has(key) ? Number(sp.get(key)) : undefined);

  // Direct lookup by ids (used by My Club to resolve saved player ids).
  if (sp.has("ids")) {
    const ids = (sp.get("ids") ?? "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isFinite(n));
    const items = getPlayersByIds(ids);
    return Response.json({ items, total: items.length });
  }

  const result = searchPlayers({
    query: sp.get("query") ?? undefined,
    position: (sp.get("position") as Position) ?? undefined,
    league: sp.get("league") ?? undefined,
    nation: sp.get("nation") ?? undefined,
    club: sp.get("club") ?? undefined,
    rarity: (sp.get("rarity") as Rarity) ?? undefined,
    minRating: numberOr("minRating"),
    maxRating: numberOr("maxRating"),
    maxPrice: numberOr("maxPrice"),
    sort: (sp.get("sort") as PlayerSort) ?? "rating",
    order: (sp.get("order") as "asc" | "desc") ?? "desc",
    limit: Math.min(numberOr("limit") ?? 40, 100),
    offset: numberOr("offset") ?? 0,
  });

  return Response.json(result);
}
