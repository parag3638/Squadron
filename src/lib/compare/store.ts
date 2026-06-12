import { useSyncExternalStore } from "react";
import type { PlayerView } from "@/components/fut/types";

/** Ephemeral compare set — up to 2 players (no persistence). */
let items: PlayerView[] = [];
const EMPTY: PlayerView[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const compare = {
  add(p: PlayerView) {
    if (items.some((x) => x.id === p.id)) return;
    items = [...items, p].slice(-2); // keep the two most recent
    emit();
  },
  toggle(p: PlayerView) {
    if (items.some((x) => x.id === p.id)) {
      items = items.filter((x) => x.id !== p.id);
      emit();
    } else {
      compare.add(p);
    }
  },
  remove(id: number) {
    items = items.filter((x) => x.id !== id);
    emit();
  },
  clear() {
    items = [];
    emit();
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  return items;
}

export function useCompare() {
  const list = useSyncExternalStore(subscribe, snap, () => EMPTY);
  return {
    items: list,
    add: compare.add,
    toggle: compare.toggle,
    remove: compare.remove,
    clear: compare.clear,
    has: (id: number) => list.some((x) => x.id === id),
  };
}
