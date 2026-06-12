"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Sparkles, Square, Loader2, AlertTriangle, Users } from "lucide-react";
import { Pitch } from "@/components/fut/Pitch";
import { PlayerHoverCard } from "@/components/fut/PlayerHoverCard";
import { RARITY } from "@/components/fut/rarity";
import { Button } from "@/components/ui/button";
import { cn, formatCoins } from "@/lib/utils";
import type { ChatMessage } from "@/app/api/chat/route";
import type { ShapedSolve } from "@/lib/fut/solve-types";
import type { PlayerView } from "@/components/fut/types";

const SUGGESTIONS = [
  "Build a cheap 84-rated Premier League squad",
  "Solve the 85-rated SBC",
  "Best wingers under 15k coins",
  "Make an 86 hybrid with high pace",
];

function SquadResult({ data }: { data: ShapedSolve & { sbc?: { name: string } } }) {
  if (!data?.slots) return null;
  return (
    <div className="mt-2">
      {!data.ok && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-[var(--color-warn)]/10 p-2 text-[11px] text-[var(--color-warn)] border border-[var(--color-warn)]/20">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Closest squad. Unmet: {data.failures.join("; ")}</span>
        </div>
      )}
      <Pitch slots={data.slots} formation={data.formation} />
    </div>
  );
}

function PlayerList({ data }: { data: { players: PlayerView[]; total: number } }) {
  if (!data?.players) return null;
  return (
    <div className="list-flush mt-2 overflow-hidden rounded-xl border border-[var(--color-line)]">
      {data.players.slice(0, 8).map((p) => (
        <PlayerHoverCard key={p.id} player={p} side="left" align="center">
          <div className="data-row cursor-default bg-[var(--color-surface)]">
            <span
              className="w-7 shrink-0 cell-num text-base font-bold leading-none"
              style={{ color: RARITY[p.rarity].accent }}
            >
              {p.rating}
            </span>
            <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
            <span className="text-xs text-[var(--color-faint)]">{p.positions[0]}</span>
            <span className="w-16 shrink-0 text-right cell-num text-xs text-[var(--color-muted)]">
              {formatCoins(p.price)}
            </span>
          </div>
        </PlayerHoverCard>
      ))}
    </div>
  );
}

export function Coach() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  // Pre-fill from a /build?ask=… deep link (e.g. the home "Ask the Gaffer" prompts).
  useEffect(() => {
    const ask = new URLSearchParams(window.location.search).get("ask");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ask) setInput(ask);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function send(text: string) {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-[var(--color-line)] px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-accent)]/12 text-[var(--color-accent)]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-sm font-bold leading-none">The Gaffer</p>
          <p className="mt-1 text-[11px] text-[var(--color-faint)]">Your FC26 squad & SBC coach</p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col justify-center">
            <p className="text-sm text-[var(--color-muted)]">
              Ask me to build a squad, solve an SBC, or scout players. I work from the live FC26 database.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-left text-sm text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent-line)]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className={cn(m.role === "user" ? "items-end" : "items-start", "flex flex-col")}>
              {m.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[92%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                          : "bg-[var(--color-surface-2)] text-[var(--color-fg)]",
                      )}
                    >
                      {part.text}
                    </div>
                  );
                }
                if (part.type === "tool-build_squad" || part.type === "tool-solve_sbc") {
                  if (part.state === "output-available")
                    return <SquadResult key={i} data={part.output as ShapedSolve} />;
                  return (
                    <ToolPending key={i} label="Building squad…" />
                  );
                }
                if (part.type === "tool-search_players") {
                  if (part.state === "output-available")
                    return <PlayerList key={i} data={part.output as { players: PlayerView[]; total: number }} />;
                  return <ToolPending key={i} label="Scouting players…" icon={Users} />;
                }
                if (part.type === "tool-list_sbcs" && part.state !== "output-available") {
                  return <ToolPending key={i} label="Checking SBCs…" />;
                }
                return null;
              })}
            </div>
          ))}
          {status === "submitted" && (
            <ToolPending label="Thinking…" />
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--color-bad)]/10 p-3 text-xs text-[var(--color-bad)] border border-[var(--color-bad)]/20">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              The AI coach needs an <code>OPENAI_API_KEY</code>. The builder, solver and search work without it.
            </span>
          </div>
        )}
      </div>

      {/* input */}
      <div className="border-t border-[var(--color-line)] p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask the Gaffer to build, solve, or scout…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-faint)] focus:border-[var(--color-accent-line)] focus:outline-none"
          />
          {busy ? (
            <Button type="button" size="icon" variant="secondary" onClick={stop} aria-label="Stop">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}

function ToolPending({
  label,
  icon: Icon = Loader2,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-muted)]">
      <Icon className={cn("h-3.5 w-3.5 text-[var(--color-accent)]", Icon === Loader2 && "animate-spin")} />
      {label}
    </div>
  );
}
