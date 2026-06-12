"use client";

import Link from "next/link";
import { Search, Sparkles, ArrowRight, Wand2 } from "lucide-react";
import { commandStore } from "@/lib/ui/command-store";

const PROMPTS = [
  "Build a cheap 84-rated Premier League squad",
  "Solve the 85-rated SBC for the lowest cost",
  "Best wingers under 15k coins",
];

/** Fills the hero's left column: a command-search bar + an AI-coach teaser. */
export function HeroAside() {
  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* command search */}
      <button
        type="button"
        onClick={() => commandStore.open()}
        className="group flex h-12 w-full items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 text-left transition-colors hover:border-[var(--color-line-2)]"
      >
        <Search className="h-4 w-4 shrink-0 text-[var(--color-faint)] transition-colors group-hover:text-[var(--color-fg)]" />
        <span className="flex-1 truncate text-sm text-[var(--color-muted)]">
          Search 11,720 players, jump anywhere…
        </span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      {/* Ask the Gaffer */}
      <div className="panel p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-accent)]/12 text-[var(--color-accent)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-none">Ask the Gaffer</p>
            <p className="mt-1 text-[11px] text-[var(--color-faint)]">
              Your AI coach builds, solves &amp; scouts on command
            </p>
          </div>
          <Link
            href="/build"
            className="ml-auto hidden items-center gap-1.5 rounded-full border border-[var(--color-line-2)] px-3 py-1 text-[11px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent-line)] hover:text-[var(--color-accent)] sm:inline-flex"
          >
            <Wand2 className="h-3 w-3" /> Open coach
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          {PROMPTS.map((p) => (
            <Link
              key={p}
              href={`/build?ask=${encodeURIComponent(p)}`}
              className="group flex items-center gap-2.5 rounded-[var(--radius-row)] border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2.5 text-[13px] text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent-line)] hover:bg-[var(--color-surface-3)]"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              <span className="flex-1 truncate">{p}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-fg)]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
