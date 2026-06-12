import { EvolutionsExplorer } from "@/components/evolutions/EvolutionsExplorer";
import { getEvolutions } from "@/lib/data/evolutions";

export const metadata = { title: "Evolutions · Squadron" };

export default function EvolutionsPage() {
  return (
    <div className="mx-auto max-w-[96rem] px-5 pt-10 sm:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Evolutions</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Pick the best players to run through each Evolution. We scan the whole database for eligible cards and
          rank them by their upgraded rating.
        </p>
      </header>
      <EvolutionsExplorer evolutions={getEvolutions()} />
    </div>
  );
}
