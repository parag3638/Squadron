"use client";

import { useState } from "react";
import { Loader2, Dna, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { PlayerCard } from "@/components/fut/PlayerCard";
import { cn, formatCoins } from "@/lib/utils";
import type { Evolution } from "@/lib/fut/evolution";
import type { PlayerView } from "@/components/fut/types";

interface Candidate {
  before: PlayerView;
  after: PlayerView;
  gain: number;
}

const UP_LABELS: Record<string, string> = {
  rating: "OVR", pace: "PAC", shooting: "SHO", passing: "PAS",
  dribbling: "DRI", defending: "DEF", physical: "PHY", skillMoves: "SM", weakFoot: "WF",
};

function upgradeChips(e: Evolution): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(e.upgrades)) {
    if (k === "addPositions" && Array.isArray(v)) out.push(`+${v.join("/")}`);
    else if (typeof v === "number" && v) out.push(`+${v} ${UP_LABELS[k] ?? k}`);
  }
  return out;
}

function reqSummary(e: Evolution): string {
  const r = e.requirements;
  const parts: string[] = [];
  if (r.maxRating) parts.push(`≤${r.maxRating} OVR`);
  if (r.maxPace) parts.push(`≤${r.maxPace} PAC`);
  if (r.positions) parts.push(r.positions.join("/"));
  return parts.join(" · ");
}

export function EvolutionsExplorer({ evolutions }: { evolutions: Evolution[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ evolution: Evolution; candidates: Candidate[] } | null>(null);

  async function select(e: Evolution) {
    setActiveId(e.id);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`/api/evolutions?id=${e.id}`).then((r) => r.json());
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* evolution list */}
      <div className="grid gap-3 lg:col-span-5">
        {evolutions.map((e) => (
          <button
            key={e.id}
            onClick={() => select(e)}
            className={cn(
              "panel panel-interactive p-5 text-left",
              activeId === e.id ? "border-[var(--color-accent-line)] glow-accent" : "border-[var(--color-line)] hover:border-[var(--color-line-2)]",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Dna className="h-4 w-4 text-[var(--color-accent)]" />
                <h3 className="font-display text-base font-bold">{e.name}</h3>
              </div>
              <Badge variant={e.cost === 0 ? "good" : "default"}>
                {e.cost === 0 ? "Free" : formatCoins(e.cost)}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">{e.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {upgradeChips(e).map((c) => (
                <Badge key={c} variant="accent">{c}</Badge>
              ))}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-[var(--color-faint)]">
              Requires: {reqSummary(e)}
            </p>
          </button>
        ))}
      </div>

      {/* candidates */}
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-20">
          {!activeId && (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line-2)] p-8 text-center">
              <TrendingUp className="h-7 w-7 text-[var(--color-faint)]" />
              <p className="mt-3 max-w-xs text-sm text-[var(--color-muted)]">
                Pick an Evolution to see the best players to run through it, ranked by upgraded rating.
              </p>
            </div>
          )}
          {loading && (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)]">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--color-accent)]" />
            </div>
          )}
          {data && !loading && (
            <div>
              <h2 className="mb-1 font-display text-xl font-bold">{data.evolution.name} — top picks</h2>
              <p className="mb-4 text-sm text-[var(--color-muted)]">
                Best eligible players, after the upgrade.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.candidates.map((c) => (
                  <div key={c.before.id} className="flex flex-col items-center">
                    <div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--color-faint)]">
                      <span className="tabular-nums">{c.before.rating}</span>
                      <ArrowRight className="h-3 w-3 text-[var(--color-accent)]" />
                      <span className="tabular-nums text-[var(--color-good)]">{c.after.rating}</span>
                    </div>
                    <PlayerCard player={c.after} size="md" showStats />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
