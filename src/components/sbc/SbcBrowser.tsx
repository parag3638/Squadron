"use client";

import { useRef, useState } from "react";
import { Loader2, Trophy, Wand2, AlertTriangle, Check } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { Pitch } from "@/components/fut/Pitch";
import { useClub } from "@/lib/club/store";
import { cn, formatCoins } from "@/lib/utils";
import type { Sbc } from "@/lib/data/sbcs";
import type { SbcConstraints } from "@/lib/fut/sbc";
import type { ShapedSolve } from "@/lib/fut/solve-types";

function summarize(c: SbcConstraints): string[] {
  const out: string[] = [];
  if (c.minRating) out.push(`${c.minRating} Rated`);
  if (c.minChemistry) out.push(`${c.minChemistry} Chem`);
  if (c.minGoldPlayers) out.push(`${c.minGoldPlayers} Gold`);
  if (c.minPlayersRated) out.push(`${c.minPlayersRated.count}× ${c.minPlayersRated.rating}+`);
  if (c.fromLeague) out.push(`${c.fromLeague.count}× ${c.fromLeague.league}`);
  if (c.fromNation) out.push(`${c.fromNation.count}× ${c.fromNation.nation}`);
  if (c.minLeagues) out.push(`${c.minLeagues} Leagues`);
  if (c.minNations) out.push(`${c.minNations} Nations`);
  return out;
}

const DIFF: Record<Sbc["difficulty"], "good" | "warn" | "bad"> = {
  easy: "good",
  medium: "warn",
  hard: "bad",
};

export function SbcBrowser({ sbcs }: { sbcs: Sbc[] }) {
  const { ids: clubIds } = useClub();
  const [useClubFodder, setUseClubFodder] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(ShapedSolve & { sbc: { name: string; reward: string } }) | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  async function solve(sbc: Sbc) {
    setActiveId(sbc.id);
    setLoading(true);
    setResult(null);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sbcId: sbc.id,
          ownedIds: useClubFodder && clubIds.length ? clubIds : undefined,
        }),
      }).then((r) => r.json());
      setResult({ ...res, sbc: { name: sbc.name, reward: sbc.reward } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* list */}
      <div className="grid gap-3 lg:col-span-7">
        {clubIds.length > 0 ? (
          <button
            type="button"
            onClick={() => setUseClubFodder((v) => !v)}
            className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] px-4 py-2.5 border border-[var(--color-line)]"
          >
            <span className="text-sm text-[var(--color-muted)]">
              Use my club ({clubIds.length}) as free fodder
            </span>
            <span
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                useClubFodder ? "bg-[var(--color-accent)]" : "bg-[var(--color-line-2)]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  useClubFodder ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </span>
          </button>
        ) : (
          <a
            href="/club"
            className="rounded-xl border border-dashed border-[var(--color-line-2)] px-4 py-2.5 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
          >
            Add players to <span className="text-[var(--color-accent)]">My Club</span> to solve SBCs with free
            fodder →
          </a>
        )}
        {sbcs.map((sbc) => (
          <button
            key={sbc.id}
            type="button"
            onClick={() => solve(sbc)}
            className={cn(
              "group panel panel-interactive p-5 text-left",
              activeId === sbc.id
                ? "border-[var(--color-accent-line)] glow-accent"
                : "border-[var(--color-line)] hover:border-[var(--color-line-2)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">{sbc.name}</h3>
                  <Badge variant={DIFF[sbc.difficulty]}>{sbc.difficulty}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{sbc.description}</p>
              </div>
              <span className="shrink-0 text-[11px] uppercase tracking-wider text-[var(--color-faint)]">
                {sbc.group}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {summarize(sbc.constraints).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                <Trophy className="h-3.5 w-3.5 text-[var(--color-gold)]" /> {sbc.reward}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100">
                <Wand2 className="h-3.5 w-3.5" /> Solve
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* solution panel */}
      <div ref={panelRef} className="lg:col-span-5">
        <div className="lg:sticky lg:top-20">
          {!activeId && (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line-2)] p-8 text-center">
              <Wand2 className="h-7 w-7 text-[var(--color-faint)]" />
              <p className="mt-3 max-w-xs text-sm text-[var(--color-muted)]">
                Pick a challenge and the solver finds the cheapest valid squad — rating and chemistry guaranteed.
              </p>
            </div>
          )}

          {activeId && loading && (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)]">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--color-accent)]" />
              <p className="mt-3 text-sm text-[var(--color-muted)]">Solving the challenge…</p>
            </div>
          )}

          {result && !loading && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">{result.sbc.name}</h2>
                {result.ok ? (
                  <Badge variant="good">Solved</Badge>
                ) : (
                  <Badge variant="bad">No clean solution</Badge>
                )}
              </div>
              {!result.ok && (
                <div className="mb-3 flex items-start gap-2 rounded-xl bg-[var(--color-bad)]/10 p-3 text-xs text-[var(--color-bad)] border border-[var(--color-bad)]/20">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Closest attempt below. Unmet: {result.failures.join("; ")}</span>
                </div>
              )}
              {result.ownedUsed ? (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-[var(--color-accent)]/10 p-3 text-xs text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Used {result.ownedUsed} from your club — saved ~{formatCoins(result.savings ?? 0)} coins.
                  </span>
                </div>
              ) : null}
              <Pitch slots={result.slots} formation={result.formation} />
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--color-faint)]">
                <Trophy className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Reward: {result.sbc.reward}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
