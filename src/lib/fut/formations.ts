import type { Position } from "./types";

export interface FormationSlot {
  position: Position;
  /** Pitch coordinates, 0–100. x: left→right. y: 0 = opponent goal, 100 = own goal (GK). */
  x: number;
  y: number;
}

export interface Formation {
  name: string;
  slots: FormationSlot[];
}

const f = (position: Position, x: number, y: number): FormationSlot => ({
  position,
  x,
  y,
});

export const FORMATIONS: Record<string, Formation> = {
  "4-3-3": {
    name: "4-3-3",
    slots: [
      f("GK", 50, 93),
      f("LB", 15, 73),
      f("CB", 37, 78),
      f("CB", 63, 78),
      f("RB", 85, 73),
      f("CM", 30, 50),
      f("CDM", 50, 58),
      f("CM", 70, 50),
      f("LW", 18, 20),
      f("ST", 50, 14),
      f("RW", 82, 20),
    ],
  },
  "4-4-2": {
    name: "4-4-2",
    slots: [
      f("GK", 50, 93),
      f("LB", 15, 72),
      f("CB", 38, 77),
      f("CB", 62, 77),
      f("RB", 85, 72),
      f("LM", 15, 45),
      f("CM", 40, 50),
      f("CM", 60, 50),
      f("RM", 85, 45),
      f("ST", 40, 16),
      f("ST", 60, 16),
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    slots: [
      f("GK", 50, 93),
      f("LB", 15, 72),
      f("CB", 38, 77),
      f("CB", 62, 77),
      f("RB", 85, 72),
      f("CDM", 37, 58),
      f("CDM", 63, 58),
      f("LM", 18, 38),
      f("CAM", 50, 36),
      f("RM", 82, 38),
      f("ST", 50, 14),
    ],
  },
  "4-1-2-1-2": {
    name: "4-1-2-1-2",
    slots: [
      f("GK", 50, 93),
      f("LB", 15, 72),
      f("CB", 38, 77),
      f("CB", 62, 77),
      f("RB", 85, 72),
      f("CDM", 50, 60),
      f("CM", 28, 46),
      f("CM", 72, 46),
      f("CAM", 50, 32),
      f("ST", 40, 15),
      f("ST", 60, 15),
    ],
  },
  "3-4-3": {
    name: "3-4-3",
    slots: [
      f("GK", 50, 93),
      f("CB", 28, 77),
      f("CB", 50, 79),
      f("CB", 72, 77),
      f("LM", 13, 50),
      f("CM", 38, 53),
      f("CM", 62, 53),
      f("RM", 87, 50),
      f("LW", 22, 20),
      f("ST", 50, 14),
      f("RW", 78, 20),
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    slots: [
      f("GK", 50, 93),
      f("CB", 28, 77),
      f("CB", 50, 79),
      f("CB", 72, 77),
      f("LWB", 11, 50),
      f("CM", 35, 54),
      f("CAM", 50, 36),
      f("CM", 65, 54),
      f("RWB", 89, 50),
      f("ST", 40, 15),
      f("ST", 60, 15),
    ],
  },
  "5-2-1-2": {
    name: "5-2-1-2",
    slots: [
      f("GK", 50, 93),
      f("LWB", 12, 64),
      f("CB", 30, 79),
      f("CB", 50, 81),
      f("CB", 70, 79),
      f("RWB", 88, 64),
      f("CM", 37, 52),
      f("CM", 63, 52),
      f("CAM", 50, 34),
      f("ST", 40, 15),
      f("ST", 60, 15),
    ],
  },
};

export const DEFAULT_FORMATION = "4-3-3";

export function getFormation(name: string): Formation {
  return FORMATIONS[name] ?? FORMATIONS[DEFAULT_FORMATION];
}

export function formationPositions(name: string): Position[] {
  return getFormation(name).slots.map((s) => s.position);
}

export const FORMATION_NAMES = Object.keys(FORMATIONS);
