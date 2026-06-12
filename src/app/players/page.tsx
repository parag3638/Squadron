import { PlayerTable } from "@/components/players/PlayerTable";
import { datasetInfo, leagues, nations } from "@/lib/data/meta";

export const metadata = { title: "Player Database · Squadron" };

export default function PlayersPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Player Database</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          All {datasetInfo.count.toLocaleString()} FC26 players — sort any column, filter, and tap a row for the
          full profile.
        </p>
      </header>
      <PlayerTable
        leagues={leagues.map((l) => l.name)}
        nations={nations.map((n) => n.name)}
      />
    </div>
  );
}
