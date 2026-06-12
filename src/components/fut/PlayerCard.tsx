import { cn, formatCoins } from "@/lib/utils";
import { RARITY, abbr } from "./rarity";
import type { PlayerView } from "./types";

const STAT_LABELS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
const GK_LABELS = ["DIV", "HAN", "KIC", "REF", "SPD", "POS"] as const;

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { w: string; rating: string; name: string; pad: string }> = {
  sm: { w: "w-[80px]", rating: "text-[27px]", name: "text-[10px]", pad: "px-2 pt-2 pb-1.5" },
  md: { w: "w-[108px]", rating: "text-[34px]", name: "text-[11px]", pad: "px-2.5 pt-2.5 pb-2" },
  lg: { w: "w-[140px]", rating: "text-[46px]", name: "text-sm", pad: "px-3 pt-3 pb-2.5" },
};

function ChemDots({ chem }: { chem: number }) {
  const color = chem >= 3 ? "var(--color-up)" : chem >= 1 ? "var(--color-warn)" : "var(--color-line-3)";
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`${chem} chemistry`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full transition-colors"
          style={{ background: i < chem ? color : "var(--color-line-2)" }}
        />
      ))}
    </div>
  );
}

export function PlayerCard({
  player,
  size = "md",
  chem,
  showStats = false,
  className,
}: {
  player: PlayerView;
  size?: Size;
  chem?: number;
  showStats?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  const r = RARITY[player.rarity];
  const isGK = player.positions[0] === "GK";
  const stats = [
    player.pace, player.shooting, player.passing,
    player.dribbling, player.defending, player.physical,
  ];
  const labels = isGK ? GK_LABELS : STAT_LABELS;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-sm)] transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1",
        s.w,
        s.pad,
        className,
      )}
      style={{
        background: `linear-gradient(176deg, ${r.sheen} 0%, var(--color-surface-2) 30%, var(--color-surface) 100%)`,
        border: player.owned
          ? "1px solid var(--color-accent-line)"
          : `1px solid color-mix(in srgb, ${r.accent} 16%, var(--color-line))`,
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 8px 22px -16px rgba(0,0,0,0.7)",
      }}
    >
      {player.owned && size === "sm" && (
        <span
          className="absolute right-1.5 top-1.5 z-10 grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
          title="From your club"
        >
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: r.sheen }}
      />
      {size !== "sm" && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-y-6 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-[800ms] ease-[var(--ease-out-soft)] group-hover:left-[130%] group-hover:opacity-100"
        />
      )}

      {/* rating + position + crests */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col leading-none">
          <span
            className={cn("font-mono font-bold tabular-nums tracking-tight", s.rating)}
            style={{ color: r.accent }}
          >
            {player.rating}
          </span>
          <span className="label mt-1 !text-[8px] text-[var(--color-muted)]">{player.positions[0]}</span>
        </div>
        {size !== "sm" && (
          <div className="flex flex-col items-end gap-1 pt-0.5">
            <span className="rounded bg-black/20 px-1.5 py-px font-mono text-[8px] font-medium tracking-wider text-[var(--color-faint)]">
              {abbr(player.nation)}
            </span>
            <span className="rounded bg-black/20 px-1.5 py-px font-mono text-[8px] font-medium tracking-wider text-[var(--color-faint)]">
              {abbr(player.club)}
            </span>
          </div>
        )}
      </div>

      {/* name */}
      <div className="mt-2 border-t border-white/[0.06] pt-1.5">
        <p className={cn("truncate text-center font-display font-semibold uppercase tracking-wide text-[var(--color-fg)]", s.name)}>
          {player.name}
        </p>
      </div>

      {chem !== undefined && <div className="mt-1.5">{<ChemDots chem={chem} />}</div>}

      {showStats && size !== "sm" && (
        <div className="mt-2 grid grid-cols-6 gap-px border-t border-white/[0.06] pt-2">
          {labels.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-[7px] tracking-wider text-[var(--color-faint)]">{label}</span>
              <span className="font-mono text-[10px] font-semibold tabular-nums text-[var(--color-fg)]">
                {stats[i] ?? "–"}
              </span>
            </div>
          ))}
        </div>
      )}

      {size === "lg" && (
        <div className="mt-2 flex items-center justify-center gap-1.5 border-t border-white/[0.06] pt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
          <span className="font-mono text-[11px] font-medium tabular-nums text-[var(--color-muted)]">
            {formatCoins(player.price)}
          </span>
        </div>
      )}
    </div>
  );
}
