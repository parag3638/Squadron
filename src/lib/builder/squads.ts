import { useSyncExternalStore } from "react";

export interface SavedSquad {
  name: string;
  formation: string;
  playerIds: (number | null)[];
}

const KEY = "fut26:squads:v1";
const EMPTY: SavedSquad[] = [];

let list: SavedSquad[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function ensure() {
  if (loaded || typeof window === "undefined") return;
  try {
    list = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    list = [];
  }
  loaded = true;
}
function commit(next: SavedSquad[]) {
  list = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

export const squadStore = {
  save(name: string, formation: string, playerIds: (number | null)[]) {
    ensure();
    commit([...list.filter((s) => s.name !== name), { name, formation, playerIds }]);
  },
  remove(name: string) {
    ensure();
    commit(list.filter((s) => s.name !== name));
  },
};

function subscribe(cb: () => void) {
  ensure();
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function snap() {
  ensure();
  return list;
}

export function useSquads() {
  const squads = useSyncExternalStore(subscribe, snap, () => EMPTY);
  return { squads, save: squadStore.save, remove: squadStore.remove };
}

/** Encode a squad for a shareable URL: "4-3-3~12,34,,56,...". */
export function encodeSquad(formation: string, playerIds: (number | null)[]): string {
  return `${formation}~${playerIds.map((id) => id ?? "").join(",")}`;
}

export function decodeSquad(code: string): { formation: string; playerIds: (number | null)[] } | null {
  const [formation, ids] = code.split("~");
  if (!formation || ids == null) return null;
  const playerIds = ids.split(",").map((s) => (s ? Number(s) : null));
  return { formation, playerIds };
}
