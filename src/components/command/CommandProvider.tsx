"use client";

import * as React from "react";
import { commandStore } from "@/lib/ui/command-store";
import { CommandPalette } from "./CommandPalette";

/** Mounts the global ⌘K listener + the palette once, around the whole app. */
export function CommandProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        commandStore.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
