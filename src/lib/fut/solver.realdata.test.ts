import { describe, it, expect } from "vitest";
import { getSolverPool } from "@/lib/data/players";
import { getSbcs } from "@/lib/data/sbcs";
import { solveSbc } from "./solver";

// Integration: exercise the solver against the real bundled FC26 dataset to
// confirm every sample SBC is solvable and fast enough for a serverless route.
describe("solveSbc on real FC26 data", () => {
  for (const sbc of getSbcs()) {
    it(`solves "${sbc.name}"`, () => {
      const pool = getSolverPool(sbc.constraints);
      const t0 = performance.now();
      const res = solveSbc({ pool, constraints: sbc.constraints });
      const ms = performance.now() - t0;
       
      console.log(
        `${sbc.name.padEnd(18)} ok=${res.ok} rating=${res.rating} chem=${res.chemistry} ` +
          `cost=${res.cost.toLocaleString()}c pool=${pool.length} ${ms.toFixed(0)}ms` +
          (res.failures.length ? ` | ${res.failures.join("; ")}` : ""),
      );
      expect(res.ok).toBe(true);
      expect(ms).toBeLessThan(4000);
    });
  }
});
