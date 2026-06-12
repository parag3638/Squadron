"use client";

import { useEffect, useState } from "react";
import { Wand2, Loader2, Trash2, Save, Share2, Check } from "lucide-react";
import { Pitch } from "@/components/fut/Pitch";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/primitives";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlayerSearch } from "@/components/players/PlayerSearch";
import { SquadAnalysis } from "./SquadAnalysis";
import { FORMATION_NAMES, formationPositions } from "@/lib/fut/formations";
import { useSquads, encodeSquad, decodeSquad } from "@/lib/builder/squads";
import type { SlotView } from "@/lib/fut/solve-types";
import type { PlayerView } from "@/components/fut/types";

const STORAGE_KEY = "fut26:squad:v1";

function emptySquad(formation: string): SlotView[] {
  return formationPositions(formation).map((position) => ({ position, player: null }));
}

function toSlotPlayer(p: PlayerView): SlotView["player"] {
  return {
    id: p.id, name: p.name, rating: p.rating, positions: p.positions,
    club: p.club, clubId: p.clubId, league: p.league, leagueId: p.leagueId,
    nation: p.nation, nationId: p.nationId, rarity: p.rarity, price: p.price,
    pace: p.pace ?? 0, shooting: p.shooting ?? 0, passing: p.passing ?? 0,
    dribbling: p.dribbling ?? 0, defending: p.defending ?? 0, physical: p.physical ?? 0,
  };
}

export function SquadBuilder({
  leagues,
  nations,
  initialSquad,
}: {
  leagues: string[];
  nations: string[];
  initialSquad?: { formation: string; slots: SlotView[] };
}) {
  const [formation, setFormation] = useState(initialSquad?.formation ?? "4-3-3");
  const [slots, setSlots] = useState<SlotView[]>(() => initialSquad?.slots ?? emptySquad("4-3-3"));
  const [pickIndex, setPickIndex] = useState<number | null>(null);
  const [ratingTarget, setRatingTarget] = useState("84");
  const [building, setBuilding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shared, setShared] = useState(false);
  const { squads, save } = useSquads();

  async function loadFromIds(nextFormation: string, ids: (number | null)[]) {
    const valid = ids.filter((x): x is number => x != null);
    const map = new Map<number, PlayerView>();
    if (valid.length) {
      const d = await fetch(`/api/players?ids=${valid.join(",")}`).then((r) => r.json());
      for (const p of d.items as PlayerView[]) map.set(p.id, p);
    }
    const positions = formationPositions(nextFormation);
    setFormation(nextFormation);
    setSlots(
      positions.map((position, i) => {
        const id = ids[i];
        const p = id != null ? map.get(id) : undefined;
        return { position, player: p ? toSlotPlayer(p) : null };
      }),
    );
  }

  // mount: load from ?squad= URL, else localStorage
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const code = new URLSearchParams(window.location.search).get("squad");
    if (code) {
      const dec = decodeSquad(decodeURIComponent(code));
      if (dec) {
        loadFromIds(dec.formation, dec.playerIds);
        setLoaded(true);
        return;
      }
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { formation: string; slots: SlotView[] };
        if (saved.slots?.length === 11) {
          setFormation(saved.formation);
          setSlots(saved.slots);
        }
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
     
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ formation, slots }));
  }, [formation, slots, loaded]);

  function changeFormation(next: string) {
    const positions = formationPositions(next);
    setSlots((prev) => positions.map((position, i) => ({ position, player: prev[i]?.player ?? null })));
    setFormation(next);
  }

  function place(p: PlayerView) {
    if (pickIndex === null) return;
    setSlots((prev) => prev.map((s, i) => (i === pickIndex ? { ...s, player: toSlotPlayer(p) } : s)));
    setPickIndex(null);
  }

  function clearSlot(i: number) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, player: null } : s)));
  }

  async function autoBuild() {
    setBuilding(true);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          constraints: { squadSize: 11, minRating: Number(ratingTarget), minChemistry: 22 },
          formation,
        }),
      }).then((r) => r.json());
      if (res.slots) {
        setSlots(res.slots);
        setFormation(res.formation);
      }
    } finally {
      setBuilding(false);
    }
  }

  function onSave() {
    const name = window.prompt("Name this squad");
    if (name?.trim()) save(name.trim(), formation, slots.map((s) => s.player?.id ?? null));
  }

  async function onShare() {
    const code = encodeSquad(formation, slots.map((s) => s.player?.id ?? null));
    const url = `${window.location.origin}/build?squad=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const current = pickIndex !== null ? slots[pickIndex]?.player : null;
  const pickPosition = pickIndex !== null ? slots[pickIndex]?.position : undefined;

  return (
    <div>
      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={formation} onChange={(e) => changeFormation(e.target.value)} className="w-auto">
          {FORMATION_NAMES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </Select>
        <Select value={ratingTarget} onChange={(e) => setRatingTarget(e.target.value)} className="w-auto">
          {[88, 86, 85, 84, 83, 82, 80].map((r) => (
            <option key={r} value={r}>{r} rated</option>
          ))}
        </Select>
        <Button onClick={autoBuild} disabled={building}>
          {building ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Auto-build
        </Button>
        {squads.length > 0 && (
          <Select
            value=""
            onChange={(e) => {
              const sq = squads.find((s) => s.name === e.target.value);
              if (sq) loadFromIds(sq.formation, sq.playerIds);
            }}
            className="w-auto"
          >
            <option value="">Load saved…</option>
            {squads.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </Select>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onSave}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button variant="ghost" size="sm" onClick={onShare}>
            {shared ? <Check className="h-4 w-4 text-[var(--color-accent)]" /> : <Share2 className="h-4 w-4" />}
            {shared ? "Copied" : "Share"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSlots(emptySquad(formation))}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <Pitch slots={slots} formation={formation} interactive onSlotClick={(i) => setPickIndex(i)} />
      <p className="mt-3 text-center text-xs text-[var(--color-faint)]">
        Tap any slot to add or replace · Auto-build optimises the whole XI · Save & Share keep your squad.
      </p>

      <SquadAnalysis slots={slots} />

      <Dialog open={pickIndex !== null} onOpenChange={(o) => !o && setPickIndex(null)}>
        <DialogContent title={`${current ? "Replace" : "Add"} player${pickPosition ? ` · ${pickPosition}` : ""}`}>
          {current && (
            <Button
              variant="secondary"
              className="mb-3 w-full"
              onClick={() => {
                if (pickIndex !== null) clearSlot(pickIndex);
                setPickIndex(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> Remove {current.name} from this slot
            </Button>
          )}
          <PlayerSearch leagues={leagues} nations={nations} onPick={place} initialPosition={pickPosition ?? ""} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
