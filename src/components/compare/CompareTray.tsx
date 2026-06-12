"use client";

import { useState } from "react";
import { X, GitCompare } from "lucide-react";
import { useCompare } from "@/lib/compare/store";
import { CompareDrawer } from "./CompareDrawer";
import { Button } from "@/components/ui/button";
import { RARITY } from "@/components/fut/rarity";

export function CompareTray() {
  const { items, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <>
      <div className="glass fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--color-line-2)] p-2 shadow-[0_10px_44px_-12px_rgba(0,0,0,0.85)]">
        <span className="label pl-2">Compare</span>
        {items.map((p) => (
          <span
            key={p.id}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-2)] py-1 pl-2 pr-1 text-xs"
          >
            <span className="font-mono font-semibold tabular-nums" style={{ color: RARITY[p.rarity].accent }}>
              {p.rating}
            </span>
            <span className="max-w-[88px] truncate">{p.name}</span>
            <button onClick={() => remove(p.id)} className="rounded-full p-0.5 text-[var(--color-faint)] hover:text-[var(--color-fg)]">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Button size="sm" disabled={items.length < 2} onClick={() => setOpen(true)}>
          <GitCompare className="h-4 w-4" /> Compare
        </Button>
        <button onClick={clear} className="rounded-full p-1.5 text-[var(--color-faint)] hover:text-[var(--color-fg)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <CompareDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
