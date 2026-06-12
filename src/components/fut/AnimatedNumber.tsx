"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

export function AnimatedNumber({
  value,
  className,
  format,
  duration = 0.6,
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{format ? format(display) : Math.round(display)}</span>;
}
