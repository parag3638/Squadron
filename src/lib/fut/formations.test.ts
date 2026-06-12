import { describe, it, expect } from "vitest";
import { FORMATIONS, getFormation, formationPositions } from "./formations";

describe("formations", () => {
  it("every formation has exactly 11 slots with one GK", () => {
    for (const f of Object.values(FORMATIONS)) {
      expect(f.slots).toHaveLength(11);
      expect(f.slots.filter((s) => s.position === "GK")).toHaveLength(1);
    }
  });

  it("every slot has on-pitch coordinates", () => {
    for (const f of Object.values(FORMATIONS)) {
      for (const s of f.slots) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(100);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("getFormation returns a known formation and falls back to a default", () => {
    expect(getFormation("4-3-3").name).toBe("4-3-3");
    expect(getFormation("does-not-exist").slots).toHaveLength(11);
  });

  it("formationPositions lists the 11 positions in order", () => {
    expect(formationPositions("4-4-2")).toEqual([
      "GK",
      "LB",
      "CB",
      "CB",
      "RB",
      "LM",
      "CM",
      "CM",
      "RM",
      "ST",
      "ST",
    ]);
  });
});
