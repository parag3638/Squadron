/**
 * Transforms the raw FC26 sofifa-sourced CSV into the app's compact, bundled
 * dataset. Run with: npm run import:data
 *
 * Source CSV (men's + women's, 18k players, 110 cols) is expected at
 * /tmp/fc26_players.csv (download once from the EAFC26-DataHub repo). We keep
 * only the fields the squad builder + solver need, derive rarity, and attach an
 * estimated price. Output: src/data/players.json + src/data/meta.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rarityFromRating, estimatePrice } from "../src/lib/fut/economy";
import type { Player, Position } from "../src/lib/fut/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.env.CSV_PATH ?? "/tmp/fc26_players.csv";
const OUT_DIR = path.join(__dirname, "..", "src", "data");
const MIN_RATING = 64; // drop the low-bronze long tail; keep all silver+gold

const VALID: ReadonlySet<string> = new Set<Position>([
  "GK", "RB", "LB", "CB", "RWB", "LWB",
  "CDM", "CM", "CAM", "RM", "LM",
  "RW", "LW", "CF", "ST",
]);

/** Minimal RFC4180 CSV parser (handles quoted fields + embedded commas/quotes). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignore; \n handles row end
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function num(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Deterministic per-player price multiplier (~0.72–1.45) so prices vary within a rating tier. */
function priceJitter(id: number): number {
  const h = (Math.imul(id || 1, 2654435761) >>> 0) / 4294967296; // 0..1
  return 0.72 + h * 0.73;
}

function main() {
  console.log(`Reading ${SRC} ...`);
  const rows = parseCSV(readFileSync(SRC, "utf8"));
  const header = rows[0];
  const col = (name: string) => header.indexOf(name);

  const C = {
    id: col("player_id"),
    short: col("short_name"),
    long: col("long_name"),
    positions: col("player_positions"),
    overall: col("overall"),
    age: col("age"),
    leagueId: col("league_id"),
    league: col("league_name"),
    clubId: col("club_team_id"),
    club: col("club_name"),
    nationId: col("nationality_id"),
    nation: col("nationality_name"),
    foot: col("preferred_foot"),
    weakFoot: col("weak_foot"),
    skill: col("skill_moves"),
    pace: col("pace"),
    shooting: col("shooting"),
    passing: col("passing"),
    dribbling: col("dribbling"),
    defending: col("defending"),
    physic: col("physic"),
    gkDiving: col("goalkeeping_diving"),
    gkHandling: col("goalkeeping_handling"),
    gkKicking: col("goalkeeping_kicking"),
    gkReflexes: col("goalkeeping_reflexes"),
    gkSpeed: col("goalkeeping_speed"),
    gkPositioning: col("goalkeeping_positioning"),
  };

  const players: Player[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 10) continue;

    const rating = num(row[C.overall]);
    if (rating < MIN_RATING) continue;

    const positions = (row[C.positions] ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter((p) => VALID.has(p)) as Position[];
    if (positions.length === 0) continue;

    const isGK = positions.includes("GK");
    const rarity = rarityFromRating(rating);

    players.push({
      id: num(row[C.id]),
      name: row[C.short] || row[C.long] || "Unknown",
      fullName: row[C.long] || undefined,
      rating,
      positions,
      league: row[C.league] || "Unknown",
      leagueId: num(row[C.leagueId]),
      nation: row[C.nation] || "Unknown",
      nationId: num(row[C.nationId]),
      club: row[C.club] || "Free Agent",
      clubId: num(row[C.clubId]),
      pace: isGK ? num(row[C.gkSpeed]) : num(row[C.pace]),
      shooting: isGK ? num(row[C.gkDiving]) : num(row[C.shooting]),
      passing: isGK ? num(row[C.gkHandling]) : num(row[C.passing]),
      dribbling: isGK ? num(row[C.gkKicking]) : num(row[C.dribbling]),
      defending: isGK ? num(row[C.gkReflexes]) : num(row[C.defending]),
      physical: isGK ? num(row[C.gkPositioning]) : num(row[C.physic]),
      skillMoves: num(row[C.skill]) || 1,
      weakFoot: num(row[C.weakFoot]) || 1,
      foot: row[C.foot] === "Left" ? "L" : "R",
      age: num(row[C.age]),
      rarity,
      price: Math.max(
        150,
        Math.round((estimatePrice(rating, rarity) * priceJitter(num(row[C.id]))) / 50) * 50,
      ),
    });
  }

  // Highest rated first — solver + search prefer this order.
  players.sort((a, b) => b.rating - a.rating);

  const tally = (key: keyof Player) => {
    const m = new Map<string, number>();
    for (const p of players) {
      const v = String(p[key]);
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const meta = {
    generatedFrom: "EAFC26-DataHub players.csv (sofifa-sourced base ratings)",
    count: players.length,
    leagues: tally("league"),
    nations: tally("nation"),
    clubs: tally("club").slice(0, 400),
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "players.json"), JSON.stringify(players));
  writeFileSync(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta));

  console.log(`Wrote ${players.length} players.`);
  console.log(`Leagues: ${meta.leagues.length}, Nations: ${meta.nations.length}`);
  console.log(`Top league: ${meta.leagues[0]?.name} (${meta.leagues[0]?.count})`);
}

main();
