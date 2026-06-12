"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-lg font-extrabold tracking-tight">
            Squad<span className="text-[var(--color-accent)]">ron</span>
          </span>
        </Link>

        <nav className="no-scrollbar -mr-2 ml-3 flex min-w-0 items-center gap-0.5 overflow-x-auto pr-2">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-line)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-fg)]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
