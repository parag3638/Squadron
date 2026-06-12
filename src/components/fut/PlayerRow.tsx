import { Check } from "lucide-react";
import { cn, formatCoins } from "@/lib/utils";
import { RARITY } from "./rarity";
import type { PlayerView } from "./types";

const STATS: { key: keyof PlayerView; label: string }[] = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical", label: "PHY" },
];

export function PlayerRow({
  player,
  onClick,
  selected,
  className,
}: {
  player: PlayerView;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  const r = RARITY[player.rarity];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "panel panel-interactive group flex w-full items-center gap-4 px-3.5 py-3 text-left",
        selected && "!border-[var(--color-accent-line)]",
        className,
      )}
    >
      {selected && (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)]">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <div className="flex w-11 shrink-0 flex-col items-center">
        <span className="font-display text-[22px] font-bold tabular-nums leading-none" style={{ color: r.accent }}>
          {player.rating}
        </span>
        <span className="label mt-1 !text-[8px]">{player.positions.slice(0, 2).join(" ")}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-fg)]">{player.name}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
          {player.club} · {player.league} · {player.nation}
        </p>
      </div>

      <div className="hidden shrink-0 grid-cols-6 gap-3 sm:grid">
        {STATS.map((s) => (
          <div key={s.label} className="flex w-7 flex-col items-center gap-0.5">
            <span className="font-mono text-[8px] tracking-wider text-[var(--color-faint)]">{s.label}</span>
            <span className="font-mono text-xs font-semibold tabular-nums">{(player[s.key] as number) ?? "–"}</span>
          </div>
        ))}
      </div>

      <div className="flex w-20 shrink-0 items-center justify-end gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
        <span className="font-mono text-sm font-medium tabular-nums text-[var(--color-muted)]">
          {formatCoins(player.price)}
        </span>
      </div>
    </button>
  );
}
