import type { PlayerView } from "@/components/fut/types";
import type { Signal } from "./pricing";

export type MarketPlayer = PlayerView & {
  value: number;
  trendPct: number;
  signal: Signal;
  history: number[];
};
