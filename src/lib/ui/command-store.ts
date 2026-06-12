import { useEffect, useSyncExternalStore, type ComponentType, type DependencyList } from "react";

/** A runnable command surfaced in the ⌘K palette. */
export interface CommandAction {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon?: ComponentType<{ className?: string }>;
  run: () => void;
}

let open = false;
let actions: CommandAction[] = [];
const EMPTY: CommandAction[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Singleton command store — same useSyncExternalStore pattern as compare/club. */
export const commandStore = {
  open() {
    if (!open) {
      open = true;
      emit();
    }
  },
  close() {
    if (open) {
      open = false;
      emit();
    }
  },
  toggle() {
    open = !open;
    emit();
  },
  setOpen(v: boolean) {
    if (open !== v) {
      open = v;
      emit();
    }
  },
  isOpen() {
    return open;
  },
  /** Register contextual actions; returns an unregister fn. */
  register(list: CommandAction[]) {
    actions = [...actions, ...list];
    emit();
    return () => {
      actions = actions.filter((a) => !list.includes(a));
      emit();
    };
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCommandOpen() {
  return useSyncExternalStore(subscribe, () => open, () => false);
}

export function useRegisteredActions() {
  return useSyncExternalStore(subscribe, () => actions, () => EMPTY);
}

/** Register palette actions for the lifetime of a component (e.g. page-specific). */
export function useRegisterCommands(make: () => CommandAction[], deps: DependencyList) {
  useEffect(() => {
    return commandStore.register(make());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
