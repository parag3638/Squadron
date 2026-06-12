"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input, Select, Skeleton } from "@/components/ui/primitives";
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
      {/* filters */}
      <div className="sticky top-16 z-10 -mx-1 mb-4 rounded-2xl bg-[var(--color-bg)]/85 px-1 py-2 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-faint)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players — Saka, Mbappé, Rodri…"
            className="h-12 pl-10 text-base"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Select value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="">All positions</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Select value={league} onChange={(e) => setLeague(e.target.value)}>
            <option value="">All leagues</option>
            {leagues.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
          <Select value={nation} onChange={(e) => setNation(e.target.value)}>
            <option value="">All nations</option>
            {nations.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </Select>
          <Select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="">Any rating</option>
            {[90, 87, 85, 83, 80, 75].map((r) => (
              <option key={r} value={r}>{r}+ rated</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Top rated</option>
            <option value="price">Cheapest</option>
            <option value="pace">Fastest</option>
            <option value="shooting">Best shooting</option>
            <option value="passing">Best passing</option>
            <option value="dribbling">Best dribbling</option>
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
