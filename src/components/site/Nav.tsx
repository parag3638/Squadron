"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { commandStore } from "@/lib/ui/command-store";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/build", label: "Build" },
  { href: "/sbc", label: "SBCs" },
  { href: "/evolutions", label: "Evos" },
  { href: "/market", label: "Market" },
  { href: "/club", label: "Club" },
  { href: "/players", label: "Players" },
  { href: "/news", label: "News" },
];

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="M13 1.5 23.4 7.5V18.5L13 24.5 2.6 18.5V7.5L13 1.5Z"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
      />
      <path d="M13 7.5 18 10.5V16.5L13 19.5 8 16.5V10.5L13 7.5Z" fill="var(--color-accent)" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] glass">
      <div className="mx-auto flex h-[68px] max-w-[96rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Mark />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Squad<span className="text-[var(--color-accent)]">ron</span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-2.5">
          <nav className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto py-1">
            {LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium tracking-tight transition-colors duration-200",
                    active
                      ? "text-[var(--color-fg)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface-2)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => commandStore.open()}
            aria-label="Open command menu"
            className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-2)] pl-3 pr-2.5 text-[var(--color-muted)] transition-colors hover:border-[var(--color-line-2)] hover:text-[var(--color-fg)]"
          >
            <Search className="h-4 w-4" />
            <span className="hidden text-sm lg:inline">Search</span>
            <kbd className="kbd hidden lg:inline-flex">⌘K</kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
