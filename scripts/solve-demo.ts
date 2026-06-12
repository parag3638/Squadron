/** Quick manual check: solve every bundled SBC against the real dataset. */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { solveSbc } from "../src/lib/fut/solver";
import { SBCS } from "../src/lib/data/sbcs";
import type { Player } from "../src/lib/fut/types";
import type { SbcConstraints } from "../src/lib/fut/sbc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALL: Player[] = JSON.parse(
  readFileSync(path.join(__dirname, "..", "src", "data", "players.json"), "utf8"),
);

function stratify(list: Player[], per: number): Player[] {
  const sorted = [...list].sort((a, b) => a.price - b.price || a.id - b.id);
  const count = new Map<number, number>();
  const out: Player[] = [];
  for (const p of sorted) {
    const n = count.get(p.rating) ?? 0;
    if (n < per) {
      out.push(p);
      count.set(p.rating, n + 1);
    }
  }
  return out;
}
function pool(c: SbcConstraints): Player[] {
  const map = new Map<number, Player>();
  for (const p of stratify(ALL, 45)) map.set(p.id, p);
  if (c.fromNation)
    for (const p of stratify(ALL.filter((p) => p.nation === c.fromNation!.nation), 30)) map.set(p.id, p);
  if (c.fromLeague)
    for (const p of stratify(ALL.filter((p) => p.league === c.fromLeague!.league), 30)) map.set(p.id, p);
  return [...map.values()];
}

for (const sbc of SBCS) {
  const t0 = performance.now();
  const r = solveSbc({ pool: pool(sbc.constraints), constraints: sbc.constraints });
  const ms = (performance.now() - t0).toFixed(0);
  console.log(
    `${sbc.name.padEnd(18)} ok=${r.ok} rating=${r.rating} chem=${r.chemistry}/33 ` +
      `cost=${r.cost.toLocaleString()}c ${ms}ms` +
      (r.failures.length ? `  ⚠ ${r.failures.join("; ")}` : ""),
  );
}
