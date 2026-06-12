"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

/** Hover-to-reveal floating card. Open/close delays tuned for "preview on hover". */
export function HoverCard(props: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root openDelay={120} closeDelay={80} {...props} />;
}

export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export function HoverCardContent({
  className,
  align = "center",
  side = "top",
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("panel anim-pop z-50 overflow-hidden focus:outline-none", className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}
