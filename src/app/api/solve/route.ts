import { z } from "zod";
import { solveForConstraints, solveSbcById } from "@/lib/fut/solve-service";

export const maxDuration = 60;

const constraintsSchema = z.object({
  squadSize: z.number().default(11),
  minRating: z.number().optional(),
  minChemistry: z.number().min(0).max(33).optional(),
  minGoldPlayers: z.number().optional(),
  minPlayersRated: z.object({ rating: z.number(), count: z.number() }).optional(),
  fromLeague: z.object({ league: z.string(), count: z.number() }).optional(),
  fromNation: z.object({ nation: z.string(), count: z.number() }).optional(),
  sameLeagueMin: z.number().optional(),
  sameNationMin: z.number().optional(),
  minLeagues: z.number().optional(),
  minNations: z.number().optional(),
});

const bodySchema = z.union([
  z.object({
    sbcId: z.string(),
    formation: z.string().optional(),
    ownedIds: z.array(z.number()).optional(),
  }),
  z.object({
    constraints: constraintsSchema,
    formation: z.string().optional(),
    maxPricePerPlayer: z.number().optional(),
    ownedIds: z.array(z.number()).optional(),
  }),
]);

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data;

  if ("sbcId" in body) {
    const solved = solveSbcById(body.sbcId, body.formation, body.ownedIds);
    if (!solved) return Response.json({ error: `Unknown SBC "${body.sbcId}"` }, { status: 404 });
    return Response.json({
      sbc: { id: solved.sbc.id, name: solved.sbc.name, reward: solved.sbc.reward },
      ...solved.result,
    });
  }

  const result = solveForConstraints(body.constraints, {
    formation: body.formation,
    baseFilter: body.maxPricePerPlayer ? { maxPrice: body.maxPricePerPlayer } : undefined,
    ownedIds: body.ownedIds,
  });
  return Response.json(result);
}
