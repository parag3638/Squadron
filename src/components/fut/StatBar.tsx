export function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(4, Math.min(100, value));
  const color =
    value >= 85 ? "var(--color-up)" : value >= 75 ? "var(--color-fg)" : value >= 60 ? "var(--color-muted)" : "var(--color-faint)";
  return (
    <div className="flex items-center gap-3">
      <span className="label w-8 shrink-0">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-3)]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-7 shrink-0 text-right font-mono text-xs font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
