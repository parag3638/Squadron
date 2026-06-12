"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

export function SheetContent({
  className,
  children,
  title,
  size = "sm",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  title?: string;
  size?: "sm" | "lg";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="anim-fade fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
      <DialogPrimitive.Content
        className={cn(
          "anim-sheet fixed right-0 top-0 z-50 flex h-full w-[calc(100vw-1.5rem)] flex-col overflow-hidden border-l border-[var(--color-line)] bg-[var(--color-bg-2)] shadow-[0_0_60px_-12px_rgba(0,0,0,0.8)] focus:outline-none",
          size === "lg" ? "max-w-[600px]" : "max-w-[400px]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3.5">
          <DialogPrimitive.Title className="label">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close className="rounded-full p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
