import { useSyncExternalStore } from "react";

/** A player in the user's club (no account — persisted to localStorage). */
export interface ClubEntry {
  id: number;
  untradeable: boolean;
}

const KEY = "fut26:club:v1";
const EMPTY: ClubEntry[] = [];

let entries: ClubEntry[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  try {
    entries = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    entries = [];
  }
  loaded = true;
}

function commit(next: ClubEntry[]) {
  entries = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(entries));
  listeners.forEach((l) => l());
}

export const club = {
  add(id: number, untradeable = false) {
    ensureLoaded();
    if (!entries.some((e) => e.id === id)) commit([...entries, { id, untradeable }]);
  },
  remove(id: number) {
    ensureLoaded();
    commit(entries.filter((e) => e.id !== id));
  },
  toggleUntradeable(id: number) {
    ensureLoaded();
    commit(entries.map((e) => (e.id === id ? { ...e, untradeable: !e.untradeable } : e)));
  },
  clear() {
    commit([]);
  },
};

function subscribe(cb: () => void) {
  ensureLoaded();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      ensureLoaded();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return entries;
}

/** Reactive view of the user's club. */
export function useClub() {
  const list = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return {
    entries: list,
    ids: list.map((e) => e.id),
    count: list.length,
    has: (id: number) => list.some((e) => e.id === id),
    add: club.add,
    remove: club.remove,
    toggleUntradeable: club.toggleUntradeable,
    clear: club.clear,
  };
}
