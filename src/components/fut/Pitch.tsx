"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus, Spline } from "lucide-react";
import { getFormation } from "@/lib/fut/formations";
import { squadMetrics } from "@/lib/fut/squad-metrics";
import type { SlotView } from "@/lib/fut/solve-types";
import { formatCoins, cn } from "@/lib/utils";
import { PlayerCard } from "./PlayerCard";
import { PlayerHoverCard } from "./PlayerHoverCard";
import { AnimatedNumber } from "./AnimatedNumber";

interface ChemLink {
  /** slot indices this link connects (for hover emphasis) */
  ai: number;
  bi: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity: number;
}

function computeLinks(slots: SlotView[], coords: { x: number; y: number }[]): ChemLink[] {
  const active = slots
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.player && s.player.positions.includes(s.position));
  const links: ChemLink[] = [];
  for (let a = 0; a < active.length; a++) {
    for (let b = a + 1; b < active.length; b++) {
      const pa = active[a].s.player!;
      const pb = active[b].s.player!;
      let color: string;
      let opacity: number;
      if (pa.clubId === pb.clubId) {
        color = "var(--color-accent)";
        opacity = 0.85;
      } else if (pa.nationId === pb.nationId) {
        color = "var(--color-info)";
        opacity = 0.6;
      } else if (pa.leagueId === pb.leagueId) {
        color = "#9fb4d8";
        opacity = 0.42;
      } else continue;
      const ca = coords[active[a].i];
      const cb = coords[active[b].i];
      links.push({
        ai: active[a].i,
        bi: active[b].i,
        x1: ca.x,
        y1: ca.y,
        x2: cb.x,
        y2: cb.y,
        color,
        opacity,
      });
    }
  }
  // strongest links drawn last (on top)
  return links.sort((x, y) => x.opacity - y.opacity);
}

export function Pitch({
  slots,
  formation,
  onSlotClick,
  interactive = false,
  className,
}: {
  slots: SlotView[];
  formation: string;
  onSlotClick?: (index: number) => void;
  interactive?: boolean;
  className?: string;
}) {
  const f = getFormation(formation);
  const m = squadMetrics(slots);
  const chemColor =
    m.chemistry >= 27 ? "var(--color-good)" : m.chemistry >= 18 ? "var(--color-warn)" : "var(--color-bad)";

  const [showLinks, setShowLinks] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const links = useMemo(() => computeLinks(slots, f.slots), [slots, f.slots]);

  // which slots are chemistry-linked to the hovered one (for emphasis/dimming)
  const linkedTo = useMemo(() => {
    const set = new Set<number>();
    if (hovered == null) return set;
    for (const l of links) {
      if (l.ai === hovered) set.add(l.bi);
      else if (l.bi === hovered) set.add(l.ai);
    }
    return set;
  }, [hovered, links]);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* metrics bar */}
      <div className="panel mb-3 flex items-end justify-around px-4 py-3.5">
        <div className="flex flex-col items-center">
          <AnimatedNumber
            value={m.rating}
            className="font-mono text-[34px] font-bold tabular-nums leading-none text-[var(--color-fg)]"
          />
          <span className="label mt-2">Rating</span>
        </div>
        <div className="h-9 w-px bg-[var(--color-line)]" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-[34px] font-bold leading-none tabular-nums" style={{ color: chemColor }}>
            <AnimatedNumber value={m.chemistry} />
            <span className="text-base text-[var(--color-faint)]">/33</span>
          </span>
          <span className="label mt-2">Chemistry</span>
        </div>
        <div className="h-9 w-px bg-[var(--color-line)]" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl font-bold tabular-nums leading-none text-[var(--color-gold)] sm:text-[28px]">
            <AnimatedNumber value={m.cost} format={formatCoins} />
          </span>
          <span className="label mt-2">Est. Cost</span>
        </div>
      </div>

      {/* pitch */}
      <div
        className="pitch-turf relative mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)]"
        style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 12px 32px -18px rgba(0,0,0,0.7)" }}
      >
        {/* broadcast line markings */}
        <svg
          viewBox="0 0 100 133"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          style={{ stroke: "var(--color-line-2)", strokeWidth: 0.4, fill: "none", opacity: 0.65 }}
        >
          <rect x="3" y="3" width="94" height="127" rx="2" />
          <line x1="3" y1="66.5" x2="97" y2="66.5" />
          <circle cx="50" cy="66.5" r="11" />
          <circle cx="50" cy="66.5" r="0.7" style={{ fill: "var(--color-line-2)" }} />
          {/* top goal/box */}
          <rect x="28" y="3" width="44" height="16" />
          <rect x="40" y="3" width="20" height="6" />
          {/* bottom goal/box */}
          <rect x="28" y="114" width="44" height="16" />
          <rect x="40" y="124" width="20" height="6" />
        </svg>
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,rgba(0,0,0,0.45))]" />

        {/* chemistry links — draw in on mount, emphasise on player hover */}
        {showLinks && links.length > 0 && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            {links.map((l, i) => {
              const touches = hovered != null && (l.ai === hovered || l.bi === hovered);
              const strokeOpacity =
                hovered == null ? l.opacity : touches ? Math.min(1, l.opacity + 0.2) : l.opacity * 0.1;
              const w = touches ? 2.6 : 1.8;
              const common = {
                x1: l.x1,
                y1: l.y1,
                x2: l.x2,
                y2: l.y2,
                stroke: l.color,
                strokeOpacity,
                strokeWidth: w,
                strokeLinecap: "round" as const,
                vectorEffect: "non-scaling-stroke" as const,
                className: "[transition:stroke-opacity_200ms,stroke-width_200ms]",
                style: { filter: `drop-shadow(0 0 ${touches ? 4 : 2.5}px ${l.color})` },
              };
              return reduce ? (
                <line key={i} {...common} />
              ) : (
                <motion.line
                  key={i}
                  {...common}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.12 + i * 0.04, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              );
            })}
          </svg>
        )}

        {/* links toggle */}
        {links.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLinks((v) => !v)}
            className={cn(
              "absolute right-2.5 top-2.5 z-20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur transition-colors",
              showLinks
                ? "border-[var(--color-accent-line)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                : "border-[var(--color-line)] bg-[var(--color-bg)]/60 text-[var(--color-muted)] hover:text-[var(--color-fg)]",
            )}
          >
            <Spline className="h-3 w-3" /> Links
          </button>
        )}

        {/* players */}
        {f.slots.map((fslot, i) => {
          const slot = slots[i];
          const player = slot?.player;
          const clickable = interactive || !!onSlotClick;
          const dimmed = hovered != null && hovered !== i && !linkedTo.has(i);
          const card = player ? (
            <div
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              className="rounded-2xl [transition:opacity_200ms]"
              style={{ opacity: dimmed ? 0.32 : 1 }}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSlotClick?.(i)}
                  className="block cursor-pointer rounded-2xl transition-transform hover:scale-105"
                >
                  <PlayerCard player={player} size="sm" chem={m.chemPerPlayer[i]} />
                </button>
              ) : (
                <PlayerCard player={player} size="sm" chem={m.chemPerPlayer[i]} />
              )}
            </div>
          ) : null;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${fslot.x}%`, top: `${fslot.y}%`, zIndex: hovered === i ? 30 : undefined }}
            >
              {player ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.035, type: "spring", stiffness: 380, damping: 26 }}
                >
                  {clickable ? card : <PlayerHoverCard player={player}>{card!}</PlayerHoverCard>}
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSlotClick?.(i)}
                  className={cn(
                    "flex h-[88px] w-[64px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[var(--color-line-2)] bg-[var(--color-bg)]/40 text-[var(--color-faint)] transition-colors",
                    onSlotClick && "hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[9px] font-semibold tracking-widest">{fslot.position}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
