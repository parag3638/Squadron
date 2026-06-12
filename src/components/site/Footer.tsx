import { datasetInfo } from "@/lib/data/meta";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] mt-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-xs text-[var(--color-faint)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          Squad<span className="text-[var(--color-accent)]">ron</span> — an AI squad builder & SBC solver for
          EA Sports FC 26 Ultimate Team.
        </p>
        <p>
          {datasetInfo.count.toLocaleString()} players · prices are estimates · not affiliated with EA Sports.
        </p>
      </div>
    </footer>
  );
}
