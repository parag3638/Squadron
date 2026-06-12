"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input, Skeleton } from "@/components/ui/primitives";
import { Select, SelectItem } from "@/components/ui/select";
import { PlayerRow } from "@/components/fut/PlayerRow";
import type { PlayerView } from "@/components/fut/types";

const POSITIONS = ["GK", "RB", "LB", "CB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "ST"];

export function PlayerSearch({
  leagues,
  nations,
  onPick,
  isSelected,
  initialPosition = "",
}: {
  leagues: string[];
  nations: string[];
  onPick?: (p: PlayerView) => void;
  isSelected?: (id: number) => boolean;
  initialPosition?: string;
}) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(initialPosition);
  const [league, setLeague] = useState("");
  const [nation, setNation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("rating");

  const [items, setItems] = useState<PlayerView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (position) params.set("position", position);
      if (league) params.set("league", league);
      if (nation) params.set("nation", nation);
      if (minRating) params.set("minRating", minRating);
      params.set("sort", sort);
      params.set("limit", "48");
      fetch(`/api/players?${params}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setItems(d.items);
          setTotal(d.total);
          setLoading(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setLoading(false);
        });
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, position, league, nation, minRating, sort]);

  return (
    <div>
      {/* filters — pinned to the top of the dialog's scroll area. The host dialog passes
          bodyClassName="pt-0" so this opaque, full-bleed bar pins flush with no bleed above it. */}
      <div className="sticky top-0 z-10 -mx-4 mb-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-faint)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players — Saka, Mbappé, Rodri…"
            className="h-12 pl-10 text-base"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Select value={position} onValueChange={setPosition} aria-label="Position">
            <SelectItem value="">All positions</SelectItem>
            {POSITIONS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </Select>
          <Select value={league} onValueChange={setLeague} aria-label="League">
            <SelectItem value="">All leagues</SelectItem>
            {leagues.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </Select>
          <Select value={nation} onValueChange={setNation} aria-label="Nation">
            <SelectItem value="">All nations</SelectItem>
            {nations.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </Select>
          <Select value={minRating} onValueChange={setMinRating} aria-label="Minimum rating">
            <SelectItem value="">Any rating</SelectItem>
            {[90, 87, 85, 83, 80, 75].map((r) => (
              <SelectItem key={r} value={String(r)}>{r}+ rated</SelectItem>
            ))}
          </Select>
          <Select value={sort} onValueChange={setSort} aria-label="Sort">
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="price">Cheapest</SelectItem>
            <SelectItem value="pace">Fastest</SelectItem>
            <SelectItem value="shooting">Best shooting</SelectItem>
            <SelectItem value="passing">Best passing</SelectItem>
            <SelectItem value="dribbling">Best dribbling</SelectItem>
          </Select>
        </div>
        <p className="mt-2 px-1 text-xs text-[var(--color-faint)]">
          {loading ? "Searching…" : `${total.toLocaleString()} players match`}
        </p>
      </div>

      {/* results */}
      <div className="flex flex-col gap-2">
        {loading && items.length === 0
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-[60px] rounded-xl" />)
          : items.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                onClick={onPick ? () => onPick(p) : undefined}
                selected={isSelected?.(p.id)}
              />
            ))}
        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--color-line-2)] py-16 text-center text-sm text-[var(--color-muted)]">
            No players match those filters. Try widening your search.
          </div>
        )}
      </div>
    </div>
  );
}
