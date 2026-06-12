"use client";

import { Star, Plus, Check, TrendingUp, TrendingDown, GitCompare } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { StatBar } from "./StatBar";
import { Sparkline } from "@/components/market/Sparkline";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RARITY } from "./rarity";
import { marketFields } from "@/lib/market/pricing";
import { useClub } from "@/lib/club/store";
import { useWatchlist } from "@/lib/market/watchlist";
import { useCompare } from "@/lib/compare/store";
import { toast } from "@/lib/ui/toast";
import { formatCoins, cn } from "@/lib/utils";
import type { PlayerView } from "./types";

const STAT = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"];
const GK = ["DIV", "HAN", "KIC", "REF", "SPD", "POS"];

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < n ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-line-3)]",
          )}
        />
      ))}
    </span>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="label">{k}</dt>
      <dd className="mt-1 truncate text-[var(--color-fg)]">{v}</dd>
    </div>
  );
}

function Body({ player }: { player: PlayerView }) {
  const r = RARITY[player.rarity];
  const isGK = player.positions[0] === "GK";
  const stats = [player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physical];
  const labels = isGK ? GK : STAT;
  const m = marketFields(player);
  const club = useClub();
  const watch = useWatchlist();
  const cmp = useCompare();
  const owned = club.has(player.id);
  const watching = watch.has(player.id);
  const comparing = cmp.has(player.id);
  const up = m.trendPct >= 0;

  return (
    <div className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <span className="font-mono text-5xl font-bold tabular-nums leading-none" style={{ color: r.accent }}>
            {player.rating}
          </span>
          <span className="label mt-2">{player.positions[0]}</span>
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="font-display text-xl font-bold leading-tight">{player.name}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {player.positions.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
            <Badge variant="accent">{r.label}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button
          variant={owned ? "secondary" : "primary"}
          onClick={() => {
            if (owned) {
              club.remove(player.id);
              toast("Removed from club", { description: player.name });
            } else {
              club.add(player.id);
              toast.success("Added to club", {
                description: player.name,
                action: { label: "Undo", onClick: () => club.remove(player.id) },
              });
            }
          }}
        >
          {owned ? <><Check className="h-4 w-4" /> In club</> : <><Plus className="h-4 w-4" /> Add to club</>}
        </Button>
        <Button variant="secondary" onClick={() => watch.toggle(player.id)}>
          <Star className={cn("h-4 w-4", watching && "fill-[var(--color-gold)] text-[var(--color-gold)]")} />
          {watching ? "Watching" : "Watch"}
        </Button>
      </div>
      <Button variant="outline" className="mt-2 w-full" onClick={() => cmp.toggle(player)}>
        <GitCompare className="h-4 w-4" />
        {comparing ? "Added to compare" : "Compare"}
      </Button>

      <div className="mt-6">
        <p className="label mb-3">Attributes</p>
        <div className="flex flex-col gap-2.5">
          {labels.map((l, i) => (
            <StatBar key={l} label={l} value={stats[i] ?? 0} />
          ))}
        </div>
      </div>

      <div className="panel mt-6 p-4">
        <div className="flex items-center justify-between">
          <p className="label">Est. price</p>
          <Badge variant={m.signal === "buy" ? "good" : m.signal === "sell" ? "warn" : "default"}>{m.signal}</Badge>
        </div>
        <div className="mt-1.5 flex items-end justify-between">
          <span className="font-mono text-2xl font-bold tabular-nums text-[var(--color-gold)]">
            {formatCoins(player.price)}
          </span>
          <span className="flex items-center gap-1 font-mono text-sm tabular-nums" style={{ color: up ? "var(--color-up)" : "var(--color-down)" }}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(m.trendPct).toFixed(1)}%
          </span>
        </div>
        <div className="mt-3">
          <Sparkline data={m.history} color={up ? "var(--color-up)" : "var(--color-down)"} width={336} height={48} />
        </div>
        <p className="mt-2 text-[11px] text-[var(--color-faint)]">Estimated — not the live market.</p>
      </div>

      <div className="mt-6">
        <p className="label mb-3">Details</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Meta k="League" v={player.league} />
          <Meta k="Nation" v={player.nation} />
          <Meta k="Club" v={player.club} />
          {player.age != null && <Meta k="Age" v={String(player.age)} />}
          {player.skillMoves != null && (
            <div>
              <dt className="label">Skill moves</dt>
              <dd className="mt-1.5">
                <Stars n={player.skillMoves} />
              </dd>
            </div>
          )}
          {player.weakFoot != null && (
            <div>
              <dt className="label">Weak foot</dt>
              <dd className="mt-1.5">
                <Stars n={player.weakFoot} />
              </dd>
            </div>
          )}
          {player.foot && <Meta k="Foot" v={player.foot === "L" ? "Left" : "Right"} />}
        </dl>
      </div>
    </div>
  );
}

export function PlayerDetailSheet({
  player,
  open,
  onOpenChange,
}: {
  player: PlayerView | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {player && (
        <SheetContent title="Player profile">
          <Body player={player} />
        </SheetContent>
      )}
    </Sheet>
  );
}
