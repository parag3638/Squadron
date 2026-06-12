import { ClubManager } from "@/components/club/ClubManager";
import { leagues, nations } from "@/lib/data/meta";

export const metadata = { title: "My Club · Squadron" };

export default function ClubPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-10 sm:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">My Club</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Add the players you already own. No login — it stays on this device. SBC solutions and squads will
          use your club for free, so you only buy the gaps.
        </p>
      </header>
      <ClubManager leagues={leagues.map((l) => l.name)} nations={nations.map((n) => n.name)} />
    </div>
  );
}
