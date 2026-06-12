import { SbcBrowser } from "@/components/sbc/SbcBrowser";
import { getSbcs } from "@/lib/data/sbcs";

export const metadata = { title: "SBC Solver · Squadron" };

export default function SbcPage() {
  return (
    <div className="mx-auto max-w-[96rem] px-5 pt-10 sm:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">SBC Solver</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Squad Building Challenges, solved for the cheapest valid squad. Tap one to see the solution build on
          the pitch. Prices are estimates.
        </p>
      </header>
      <SbcBrowser sbcs={getSbcs()} />
    </div>
  );
}
