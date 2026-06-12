import { getEvolutions, getEvolutionById } from "@/lib/data/evolutions";
import { getAllPlayers } from "@/lib/data/players";
import { rankCandidates } from "@/lib/fut/evolution";
import type { Player } from "@/lib/fut/types";

function view(p: Player) {
  return {
    id: p.id, name: p.name, rating: p.rating, positions: p.positions,
    club: p.club, clubId: p.clubId, league: p.league, leagueId: p.leagueId,
    nation: p.nation, nationId: p.nationId, rarity: p.rarity, price: p.price,
    pace: p.pace, shooting: p.shooting, passing: p.passing,
    dribbling: p.dribbling, defending: p.defending, physical: p.physical,
  };
}

export function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return Response.json({ evolutions: getEvolutions() });
  }

  const evo = getEvolutionById(id);
  if (!evo) return Response.json({ error: `Unknown evolution "${id}"` }, { status: 404 });

  const candidates = rankCandidates(evo, getAllPlayers(), 12).map((c) => ({
    before: view(c.player),
    after: view(c.after),
    gain: c.after.rating - c.player.rating,
  }));

  return Response.json({ evolution: evo, candidates });
}
