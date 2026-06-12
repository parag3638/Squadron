import { useSyncExternalStore } from "react";

/** A tiny localStorage-backed set of player ids, reactive via useSyncExternalStore. */
export function createIdStore(key: string) {
  const EMPTY: number[] = [];
  let ids: number[] = EMPTY;
  let loaded = false;
  const listeners = new Set<() => void>();

  function ensure() {
    if (loaded || typeof window === "undefined") return;
    try {
      ids = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      ids = [];
    }
    loaded = true;
  }
  function commit(next: number[]) {
    ids = next;
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(ids));
    listeners.forEach((l) => l());
  }

  const add = (id: number) => {
    ensure();
    if (!ids.includes(id)) commit([...ids, id]);
  };
  const remove = (id: number) => {
    ensure();
    commit(ids.filter((i) => i !== id));
  };
  const toggle = (id: number) => {
    ensure();
    commit(ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);
  };
  const clear = () => commit([]);

  function subscribe(cb: () => void) {
    ensure();
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
  function snap() {
    ensure();
    return ids;
  }

  function useStore() {
    const list = useSyncExternalStore(subscribe, snap, () => EMPTY);
    return { ids: list, has: (id: number) => list.includes(id), add, remove, toggle, clear };
  }

  return { useStore, add, remove, toggle, clear };
}
