import { tool } from "ai";
import { z } from "zod";
import { searchPlayers } from "@/lib/data/players";
import { getSbcs } from "@/lib/data/sbcs";
import { resolveLeague, resolveNation } from "@/lib/data/meta";
import { solveForConstraints, solveSbcById } from "@/lib/fut/solve-service";
import type { Position } from "@/lib/fut/types";

const POSITIONS = [
  "GK", "RB", "LB", "CB", "RWB", "LWB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "CF", "ST",
] as const;

export const futTools = {
  search_players: tool({
    description:
      "Search the FC26 player database by name, position, league, nation, club, rating range, or max price. Use for any question about specific players, the best players for a budget/league/nation, or Evolution candidates.",
    inputSchema: z.object({
      query: z.string().optional().describe("Name to search for, e.g. 'Saka'"),
      position: z.enum(POSITIONS).optional(),
      league: z.string().optional().describe("League name, e.g. 'Premier League'"),
      nation: z.string().optional().describe("Nation name, e.g. 'Brazil'"),
      club: z.string().optional(),
      minRating: z.number().optional(),
      maxRating: z.number().optional(),
      maxPrice: z.number().optional().describe("Max estimated price in coins"),
      sort: z.enum(["rating", "price", "pace", "shooting", "passing", "dribbling", "defending", "physical"]).optional(),
      limit: z.number().min(1).max(25).optional(),
    }),
    execute: async (args) => {
      const { items, total } = searchPlayers({
        query: args.query,
        position: args.position as Position | undefined,
        league: args.league ? resolveLeague(args.league) : undefined,
        nation: args.nation ? resolveNation(args.nation) : undefined,
        club: args.club,
        minRating: args.minRating,
        maxRating: args.maxRating,
        maxPrice: args.maxPrice,
        sort: args.sort,
        limit: args.limit ?? 12,
      });
      return {
        total,
        players: items.map((p) => ({
          id: p.id, name: p.name, rating: p.rating, positions: p.positions,
          club: p.club, clubId: p.clubId, league: p.league, leagueId: p.leagueId,
          nation: p.nation, nationId: p.nationId, rarity: p.rarity, price: p.price,
          pace: p.pace, shooting: p.shooting, passing: p.passing,
          dribbling: p.dribbling, defending: p.defending, physical: p.physical,
        })),
      };
    },
  }),

  build_squad: tool({
    description:
      "Build/optimise a squad from natural-language requirements. Returns the cheapest valid 11-player squad meeting the targets, rendered on a pitch. Use when the user asks to build/make a team, a hybrid, a league/nation squad, or to hit a rating/chemistry target on a budget.",
    inputSchema: z.object({
      formation: z.string().optional().describe("e.g. '4-3-3', '4-2-3-1' (default 4-3-3)"),
      minRating: z.number().optional().describe("Target team rating (default 83)"),
      minChemistry: z.number().min(0).max(33).optional().describe("Target team chemistry, 0–33"),
      league: z.string().optional().describe("Build around this league"),
      nation: z.string().optional().describe("Build around this nation"),
      leagueCount: z.number().optional().describe("How many players from `league` (default 8)"),
      nationCount: z.number().optional().describe("How many players from `nation` (default 8)"),
      minLeagues: z.number().optional(),
      minNations: z.number().optional(),
      maxPricePerPlayer: z.number().optional().describe("Budget cap per player in coins"),
    }),
    execute: async (args) => {
      const league = args.league ? resolveLeague(args.league) : undefined;
      const nation = args.nation ? resolveNation(args.nation) : undefined;
      return solveForConstraints(
        {
          squadSize: 11,
          minRating: args.minRating ?? 83,
          minChemistry: args.minChemistry,
          fromLeague: league ? { league, count: args.leagueCount ?? 8 } : undefined,
          fromNation: nation ? { nation, count: args.nationCount ?? 8 } : undefined,
          minLeagues: args.minLeagues,
          minNations: args.minNations,
        },
        {
          formation: args.formation,
          baseFilter: args.maxPricePerPlayer ? { maxPrice: args.maxPricePerPlayer } : undefined,
        },
      );
    },
  }),

  list_sbcs: tool({
    description: "List the available Squad Building Challenges with their requirements and rewards.",
    inputSchema: z.object({}),
    execute: async () =>
      getSbcs().map((s) => ({
        id: s.id, name: s.name, group: s.group, difficulty: s.difficulty,
        reward: s.reward, description: s.description, requirements: s.constraints,
      })),
  }),

  solve_sbc: tool({
    description:
      "Solve a specific SBC by id (from list_sbcs) and return the cheapest valid squad on a pitch. Use when the user wants to complete or price-check a named SBC.",
    inputSchema: z.object({
      sbcId: z.string().describe("The SBC id, e.g. '85-rated'"),
      formation: z.string().optional(),
    }),
    execute: async ({ sbcId, formation }) => {
      const solved = solveSbcById(sbcId, formation);
      if (!solved) return { error: `No SBC with id "${sbcId}". Call list_sbcs first.` };
      return { sbc: { id: solved.sbc.id, name: solved.sbc.name, reward: solved.sbc.reward }, ...solved.result };
    },
  }),
};
