import type { Rarity } from "@/lib/fut/types";

export interface RarityStyle {
  /** Accent colour for the rating, frame edge and sheen. */
  accent: string;
  /** Soft glow / sheen colour. */
  sheen: string;
  label: string;
}

export const RARITY: Record<Rarity, RarityStyle> = {
  gold: { accent: "#e6c56c", sheen: "rgba(230,197,108,0.10)", label: "Gold" },
  silver: { accent: "#c2c8d2", sheen: "rgba(194,200,210,0.09)", label: "Silver" },
  bronze: { accent: "#c6926a", sheen: "rgba(198,146,106,0.10)", label: "Bronze" },
  special: { accent: "#ecd070", sheen: "rgba(236,208,112,0.14)", label: "Special" },
  icon: { accent: "#ece2c8", sheen: "rgba(236,226,200,0.14)", label: "Icon" },
  hero: { accent: "#c77dff", sheen: "rgba(199,125,255,0.14)", label: "Hero" },
};

/** 2–3 letter crest fallback from a club or nation name. */
export function abbr(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
