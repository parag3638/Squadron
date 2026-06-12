"use client";

import * as React from "react";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import {
  Home,
  Hammer,
  Layers,
  Dna,
  TrendingUp,
  Shield,
  Database,
  Newspaper,
  Search,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { commandStore, useCommandOpen, useRegisteredActions } from "@/lib/ui/command-store";
import { RARITY } from "@/components/fut/rarity";
import type { PlayerView } from "@/components/fut/types";
import { formatCoins } from "@/lib/utils";

const NAV: { href: string; label: string; sub: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", sub: "War-room", icon: Home },
  { href: "/build", label: "Build", sub: "Squad builder", icon: Hammer },
  { href: "/sbc", label: "SBCs", sub: "Solver", icon: Layers },
  { href: "/evolutions", label: "Evolutions", sub: "Upgrades", icon: Dna },
  { href: "/market", label: "Market", sub: "Prices & trends", icon: TrendingUp },
  { href: "/club", label: "Club", sub: "Your players", icon: Shield },
  { href: "/players", label: "Players", sub: "Database", icon: Database },
  { href: "/news", label: "News", sub: "Promos", icon: Newspaper },
];

export function CommandPalette() {
  const open = useCommandOpen();
  const actions = useRegisteredActions();
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [players, setPlayers] = React.useState<PlayerView[]>([]);

  React.useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlayers((prev) => (prev.length ? [] : prev));
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/players?query=${encodeURIComponent(query)}&limit=6`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setPlayers(d.items ?? []))
        .catch(() => {});
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const run = (fn: () => void) => {
    commandStore.close();
    fn();
  };

  const ql = q.trim().toLowerCase();
  const navMatches = NAV.filter((n) => !ql || n.label.toLowerCase().includes(ql));
  const actionMatches = actions.filter(
    (a) => !ql || a.label.toLowerCase().includes(ql) || (a.keywords ?? "").toLowerCase().includes(ql),
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        commandStore.setOpen(v);
        if (!v) {
          setQ("");
          setPlayers([]);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="anim-fade fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
        <Dialog.Content className="panel anim-pop fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden p-0 focus:outline-none">
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search players, jump to a page, or run an action.
          </Dialog.Description>
          <Command shouldFilter={false} loop label="Command menu">
            <div className="flex items-center gap-2.5 border-b border-[var(--color-line)] px-4">
        <Search className="h-4 w-4 shrink-0 text-[var(--color-faint)]" />
        <Command.Input
          autoFocus
          value={q}
          onValueChange={setQ}
          placeholder="Search players, jump to a page, run an action…"
          className="h-12 flex-1 bg-transparent text-sm text-[var(--color-fg)] placeholder:text-[var(--color-faint)] focus:outline-none"
        />
        <kbd className="kbd shrink-0">ESC</kbd>
      </div>

      <Command.List className="max-h-[54vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-[var(--color-muted)]">
          No matches.
        </Command.Empty>

        {actionMatches.length > 0 && (
          <Command.Group heading="Actions">
            {actionMatches.map((a) => (
              <Command.Item key={a.id} value={`action-${a.id}`} onSelect={() => run(a.run)} className="cmd-item">
                {a.icon ? (
                  <a.icon className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                ) : (
                  <CornerDownLeft className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                )}
                <span className="flex-1 truncate">{a.label}</span>
                {a.hint && <kbd className="kbd">{a.hint}</kbd>}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {players.length > 0 && (
          <Command.Group heading="Players">
            {players.map((p) => (
              <Command.Item
                key={p.id}
                value={`player-${p.id}`}
                onSelect={() => run(() => router.push("/players"))}
                className="cmd-item"
              >
                <span
                  className="w-7 shrink-0 text-right font-mono text-sm font-bold tabular-nums"
                  style={{ color: RARITY[p.rarity].accent }}
                >
                  {p.rating}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                <span className="hidden text-xs text-[var(--color-muted)] sm:inline">
                  {p.positions[0]} · {p.club}
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--color-faint)]">
                  {formatCoins(p.price)}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {navMatches.length > 0 && (
          <Command.Group heading="Navigate">
            {navMatches.map((n) => (
              <Command.Item
                key={n.href}
                value={`nav-${n.href}`}
                onSelect={() => run(() => router.push(n.href))}
                className="cmd-item"
              >
                <n.icon className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                <span className="flex-1 truncate">{n.label}</span>
                <span className="text-xs text-[var(--color-faint)]">{n.sub}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
