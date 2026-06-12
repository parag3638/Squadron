"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsDigest() {
  const [loading, setLoading] = useState(false);
  const [digest, setDigest] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function generate() {
    setLoading(true);
    setError(false);
    setDigest(null);
    try {
      const res = await fetch("/api/news/digest", { method: "POST" });
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setDigest(data.digest);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-accent)]/12 text-[var(--color-accent)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold leading-none">This week in FUT</p>
            <p className="mt-1 text-[11px] text-[var(--color-faint)]">AI digest of the latest news</p>
          </div>
        </div>
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {digest ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {digest && (
        <div className="mt-4 whitespace-pre-wrap border-t border-[var(--color-line)] pt-4 text-sm leading-relaxed text-[var(--color-fg)]">
          {digest}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-2 border-t border-[var(--color-line)] pt-4 text-xs text-[var(--color-bad)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            The AI digest needs an <code>OPENAI_API_KEY</code>. The promo calendar and news feed below work
            without it.
          </span>
        </div>
      )}
    </div>
  );
}
