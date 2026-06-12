import { SquadBuilder } from "@/components/builder/SquadBuilder";
import { Coach } from "@/components/chat/Coach";
import { solveForConstraints } from "@/lib/fut/solve-service";
import { leagues, nations } from "@/lib/data/meta";

export const metadata = { title: "Squad Builder · Squadron" };

export default function BuildPage() {
  const starter = solveForConstraints(
    { squadSize: 11, minRating: 84, minChemistry: 24 },
    { formation: "4-3-3" },
  );

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Squad Builder</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[var(--color-muted)]">
          Build by hand with live chemistry, let Auto-build optimise the XI, or just tell the Gaffer what you
          want. Prices are estimates.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SquadBuilder
            leagues={leagues.map((l) => l.name)}
            nations={nations.map((n) => n.name)}
            initialSquad={{ formation: starter.formation, slots: starter.slots }}
          />
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20 h-[640px]">
            <Coach />
          </div>
        </div>
      </div>
    </div>
  );
}
