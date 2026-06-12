"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { Input, Skeleton } from "@/components/ui/primitives";
import { Select, SelectItem } from "@/components/ui/select";
import { PlayerDetailSheet } from "@/components/fut/PlayerDetailSheet";
import { RARITY } from "@/components/fut/rarity";
import { cn, formatCoins } from "@/lib/utils";
import type { PlayerView } from "@/components/fut/types";

const PAGE_SIZE = 25;
const POSITIONS = ["GK", "RB", "LB", "CB", "CDM", "CM", "CAM", "RM", "LM", "RW", "LW", "ST"];

type Sort = "rating" | "price" | "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical";
const STAT_COLS: { key: Sort; label: string }[] = [
  { key: "pace", label: "PAC" },
  { key: "shooting", label: "SHO" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical", label: "PHY" },
];

function SortHead({
  label,
  active,
  order,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  order: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "label inline-flex items-center gap-1 transition-colors hover:text-[var(--color-fg)]",
        active && "!text-[var(--color-accent)]",
        className,
      )}
    >
      {label}
      {active && (order === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
    </button>
  );
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const out: (number | "…")[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 2) out.push("…");
  out.push(total - 1);
  return out;
}

export function PlayerTable({ leagues, nations }: { leagues: string[]; nations: string[] }) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("");
  const [league, setLeague] = useState("");
  const [nation, setNation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState<Sort>("rating");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const [items, setItems] = useState<PlayerView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlayerView | null>(null);

  // reset to first page when filters/sort change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPage(0), [query, position, league, nation, minRating, sort, order]);

  const filterKey = `${query}|${position}|${league}|${nation}|${minRating}|${sort}|${order}|${page}`;
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      const p = new URLSearchParams();
      if (query) p.set("query", query);
      if (position) p.set("position", position);
      if (league) p.set("league", league);
      if (nation) p.set("nation", nation);
      if (minRating) p.set("minRating", minRating);
      p.set("sort", sort);
      p.set("order", order);
      p.set("limit", String(PAGE_SIZE));
      p.set("offset", String(page * PAGE_SIZE));
      fetch(`/api/players?${p}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setItems(d.items);
          setTotal(d.total);
          setLoading(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);

  function toggleSort(key: Sort) {
    if (sort === key) setOrder((o) => (o === "desc" ? "asc" : "desc"));
    else {
      setSort(key);
      setOrder("desc");
    }
  }

  return (
    <div>
      {/* filters */}
      <div className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-faint)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players — Saka, Mbappé, Rodri…"
            className="h-12 pl-10 text-base"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
        </div>
      </div>

      {/* table */}
      <div className="panel overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-2.5">
          <span className="label w-5 text-center">#</span>
          <SortHead label="OVR" active={sort === "rating"} order={order} onClick={() => toggleSort("rating")} className="w-9 justify-center" />
          <span className="label flex-1">Player</span>
          <span className="label hidden w-10 text-center md:block">POS</span>
          <div className="hidden gap-3 lg:flex">
            {STAT_COLS.map((c) => (
              <SortHead key={c.key} label={c.label} active={sort === c.key} order={order} onClick={() => toggleSort(c.key)} className="w-7 justify-center" />
            ))}
          </div>
          <SortHead label="Price" active={sort === "price"} order={order} onClick={() => toggleSort("price")} className="w-20 justify-end" />
        </div>

        {/* rows */}
        {loading ? (
          <div className="flex flex-col">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-b border-[var(--color-line)] px-4 py-3 last:border-0">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-muted)]">No players match those filters.</div>
        ) : (
          <div className="flex flex-col">
            {items.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="group flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-[var(--color-surface-2)]"
              >
                <span className="w-5 text-center font-mono text-[11px] text-[var(--color-faint)]">
                  {page * PAGE_SIZE + i + 1}
                </span>
                <span className="w-9 cell-num text-center text-lg font-bold" style={{ color: RARITY[p.rarity].accent }}>
                  {p.rating}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-fg)]">{p.name}</p>
                  <p className="truncate text-xs text-[var(--color-faint)]">
                    {p.club} · {p.league} · {p.nation}
                  </p>
                </div>
                <span className="hidden w-10 text-center font-mono text-xs text-[var(--color-muted)] md:block">
                  {p.positions[0]}
                </span>
                <div className="hidden gap-3 lg:flex">
                  {STAT_COLS.map((c) => (
                    <span key={c.key} className="w-7 text-center font-mono text-xs tabular-nums text-[var(--color-muted)]">
                      {(p[c.key as keyof PlayerView] as number) ?? "–"}
                    </span>
                  ))}
                </div>
                <span className="w-20 text-right font-mono text-sm font-medium tabular-nums text-[var(--color-gold)]">
                  {formatCoins(p.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* pagination */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-[var(--color-muted)]">
          {loading ? "Loading…" : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-2)] hover:text-[var(--color-fg)] disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageWindow(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-1 text-xs text-[var(--color-faint)]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-8 min-w-8 rounded-lg px-2 font-mono text-xs tabular-nums transition-colors",
                  p === page
                    ? "bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-line-2)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
                )}
              >
                {p + 1}
              </button>
            ),
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-2)] hover:text-[var(--color-fg)] disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PlayerDetailSheet player={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
