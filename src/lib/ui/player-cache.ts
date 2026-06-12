import { useEffect, useSyncExternalStore } from "react";
import type { PlayerView } from "@/components/fut/types";

/** Tiny client cache so repeated hover previews are instant. */
const cache = new Map<number, PlayerView>();
const inflight = new Set<number>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function primePlayer(p: PlayerView) {
  if (p && !cache.has(p.id)) cache.set(p.id, p);
}

async function load(id: number) {
  if (cache.has(id) || inflight.has(id)) return;
  inflight.add(id);
  try {
    const res = await fetch(`/api/players?ids=${id}`);
    const data = await res.json();
    const p: PlayerView | undefined = (data.items ?? [])[0];
    if (p) {
      cache.set(id, p);
      emit();
    }
  } catch {
    /* hover preview is best-effort */
  } finally {
    inflight.delete(id);
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Resolve a player for a hover preview. If a `seed` (full PlayerView) is given it
 * renders immediately; otherwise the player is fetched by id and cached.
 */
export function usePlayerPreview(id: number | undefined, seed?: PlayerView): PlayerView | undefined {
  const cached = useSyncExternalStore(
    subscribe,
    () => (id != null ? cache.get(id) : undefined),
    () => undefined,
  );
  useEffect(() => {
    if (seed) primePlayer(seed);
    else if (id != null) load(id);
  }, [id, seed]);
  return seed ?? cached;
}
