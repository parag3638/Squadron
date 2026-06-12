"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, X, UserPlus, Trash2, Plus } from "lucide-react";
import { useClub } from "@/lib/club/store";
import { PlayerSearch } from "@/components/players/PlayerSearch";
import { RARITY } from "@/components/fut/rarity";
import { StatTile } from "@/components/fut/StatTile";
import { PlayerHoverCard } from "@/components/fut/PlayerHoverCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/lib/ui/toast";
import { cn, formatCoins } from "@/lib/utils";
import type { PlayerView } from "@/components/fut/types";

export function ClubManager({ leagues, nations }: { leagues: string[]; nations: string[] }) {
  const { entries, ids, has, add, remove, toggleUntradeable, clear } = useClub();
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const key = ids.join(",");
  useEffect(() => {
    if (ids.length === 0) return;
    fetch(`/api/players?ids=${key}`)
      .then((r) => r.json())
      .then((d) => setPlayers(d.items))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const idSet = new Set(ids);
  const owned = players.filter((p) => idSet.has(p.id));
  const untradeableSet = new Set(entries.filter((e) => e.untradeable).map((e) => e.id));
  const tradeableValue = owned
    .filter((p) => !untradeableSet.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);
  const ordered = [...owned].sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Players" value={String(entries.length)} />
        <Stat label="Untradeable" value={String(untradeableSet.size)} />
        <Stat label="Tradeable value" value={formatCoins(tradeableValue)} accent="var(--color-gold)" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Your Club</h2>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              onClick={() => {
                const count = entries.length;
                clear();
                toast("Club cleared", { description: `${count} player${count === 1 ? "" : "s"} removed` });
              }}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-faint)] transition-colors hover:text-[var(--color-bad)]"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add players
          </Button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="panel flex flex-col items-center py-14 text-center">
          <UserPlus className="h-7 w-7 text-[var(--color-faint)]" />
          <p className="mt-3 max-w-xs text-sm text-[var(--color-muted)]">
            Your club is empty. Add players you own and SBC solutions will use them for{" "}
            <span className="text-[var(--color-accent)]">free</span>.
          </p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add players
          </Button>
        </div>
      ) : (
        <div className="no-scrollbar flex max-h-[58vh] flex-col gap-1.5 overflow-y-auto">
          {ordered.map((p) => {
            const ut = untradeableSet.has(p.id);
            return (
              <PlayerHoverCard key={p.id} player={p} side="right" align="center">
                <div className="panel panel-interactive flex items-center gap-3 px-3.5 py-2.5">
                  <span className="w-7 cell-num text-lg font-bold" style={{ color: RARITY[p.rarity].accent }}>
                    {p.rating}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-[var(--color-faint)]">
                      {p.positions[0]} · {p.club}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleUntradeable(p.id)}
                    title={ut ? "Untradeable" : "Tradeable"}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors",
                      ut
                        ? "border-[var(--color-warn)]/30 bg-[var(--color-warn)]/12 text-[var(--color-warn)]"
                        : "border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-faint)] hover:text-[var(--color-fg)]",
                    )}
                  >
                    {ut ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {ut ? "UT" : "Tradeable"}
                  </button>
                  <span className="w-14 text-right cell-num text-xs text-[var(--color-muted)]">
                    {ut ? "—" : formatCoins(p.price)}
                  </span>
                  <button
                    onClick={() => {
                      remove(p.id);
                      toast("Removed from club", {
                        description: p.name,
                        action: { label: "Undo", onClick: () => add(p.id) },
                      });
                    }}
                    aria-label={`Remove ${p.name}`}
                    className="rounded-full p-1 text-[var(--color-faint)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-bad)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </PlayerHoverCard>
            );
          })}
        </div>
      )}

      {entries.length > 0 && (
        <Button asChild variant="secondary" className="mt-4 w-full">
          <a href="/sbc">Use my club to solve SBCs →</a>
        </Button>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent title="Add players to your club">
          <p className="mb-3 text-xs text-[var(--color-muted)]">
            Tap a player to add or remove. Added players show a check.
          </p>
          <PlayerSearch
            leagues={leagues}
            nations={nations}
            onPick={(p) => (has(p.id) ? remove(p.id) : add(p.id))}
            isSelected={has}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="panel px-4 py-3">
      <StatTile align="start" size="md" value={value} label={label} color={accent} />
    </div>
  );
}
