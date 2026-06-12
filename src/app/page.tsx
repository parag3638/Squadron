import Link from "next/link";
import {
  Sparkles,
  Layers,
  Database,
  ArrowRight,
  Trophy,
  TrendingDown,
  Crown,
} from "lucide-react";
import { Pitch } from "@/components/fut/Pitch";
import { SquadSummaryCard } from "@/components/fut/SquadSummaryCard";
import { SectionHeader } from "@/components/site/Section";
import { MarketRow } from "@/components/market/MarketRow";
import { RARITY } from "@/components/fut/rarity";
import { Badge } from "@/components/ui/primitives";
import { solveForConstraints, solveSbcById } from "@/lib/fut/solve-service";
import { searchPlayers } from "@/lib/data/players";
import { getSbcs } from "@/lib/data/sbcs";
import { movers } from "@/lib/market/market";
import { getPromos, getNews } from "@/lib/data/news";
import { datasetInfo, leagues, nations } from "@/lib/data/meta";
import { formatCoins } from "@/lib/utils";

const QUICK = [
  { href: "/build", icon: Sparkles, title: "Build a Squad", body: "Interactive pitch, live chemistry, AI coach." },
  { href: "/sbc", icon: Layers, title: "Solve an SBC", body: "Cheapest valid solution, one click." },
  { href: "/players", icon: Database, title: "Browse Players", body: `Search all ${datasetInfo.count.toLocaleString()} FC26 players.` },
];

export default function Home() {
  const squadOfDay = solveForConstraints(
    { squadSize: 11, minRating: 87, minChemistry: 22 },
    { formation: "4-3-3" },
  );

  const metas = [
    { title: "Budget 84 Starter", tag: "Budget", solve: solveForConstraints({ squadSize: 11, minRating: 84, minChemistry: 24 }) },
    { title: "Solid 86 Squad", tag: "Upgrade", solve: solveForConstraints({ squadSize: 11, minRating: 86, minChemistry: 20 }) },
    { title: "Premier League 85", tag: "League", solve: solveForConstraints({ squadSize: 11, minRating: 85, minChemistry: 24, fromLeague: { league: "Premier League", count: 8 } }) },
    { title: "Samba Stars 84", tag: "Nation", solve: solveForConstraints({ squadSize: 11, minRating: 84, minChemistry: 22, fromNation: { nation: "Brazil", count: 8 } }) },
    { title: "La Liga 86", tag: "League", solve: solveForConstraints({ squadSize: 11, minRating: 86, minChemistry: 22, fromLeague: { league: "La Liga", count: 8 } }) },
    { title: "World Hybrid 83", tag: "Foundations", solve: solveForConstraints({ squadSize: 11, minRating: 83, minChemistry: 25, minLeagues: 5, minNations: 5 }) },
  ];

  const sbcCosts = getSbcs().map((sbc) => ({ sbc, cost: solveSbcById(sbc.id)?.result.cost ?? 0 }));
  const topPlayers = searchPlayers({ sort: "rating", limit: 10 }).items;
  const bargains = searchPlayers({ minRating: 84, sort: "price", order: "asc", limit: 8 }).items;
  const maxLeague = leagues[0]?.count ?? 1;
  const { up, down } = movers(3);
  const promos = getPromos();
  const livePromos = promos.filter((p) => p.status === "live");
  const latestNews = getNews().slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 pb-4 sm:px-8">
      {/* launchpad */}
      <section className="grid gap-8 lg:grid-cols-[1fr_440px] lg:gap-10">
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            EA Sports FC 26 · Ultimate Team
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold leading-[0.98] tracking-tight text-balance">
            Your Ultimate Team war-room.
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-muted)]">
            No login, no setup — just open and solve your squad. Build, optimise, and complete SBCs for the
            cheapest valid coins, with an AI coach that knows ball.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {QUICK.map((q) => (
              <Link
                key={q.title}
                href={q.href}
                className="group relative overflow-hidden panel panel-interactive p-4"
              >
                <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[var(--color-accent-soft)] opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <q.icon className="h-5 w-5 text-[var(--color-accent)]" />
                <p className="mt-3 font-display text-sm font-bold">{q.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{q.body}</p>
              </Link>
            ))}
          </div>

          {/* numbers strip */}
          <div className="mt-auto grid grid-cols-4 gap-4 border-t border-[var(--color-line)] pt-6">
            {[
              { v: datasetInfo.count.toLocaleString(), l: "Players" },
              { v: String(leagues.length), l: "Leagues" },
              { v: String(nations.length), l: "Nations" },
              { v: String(getSbcs().length), l: "SBCs" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl font-extrabold tabular-nums">{s.v}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--color-faint)]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-faint)]">
            <Crown className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Squad of the Day
          </div>
          <Pitch slots={squadOfDay.slots} formation={squadOfDay.formation} />
        </div>
      </section>

      {/* meta squads */}
      <section className="mt-16">
        <SectionHeader
          title="Meta squads, pre-solved"
          subtitle="Ready-made templates with live ratings, chemistry and estimated cost."
          action={{ label: "Build your own", href: "/build" }}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metas.map((m) => (
            <SquadSummaryCard key={m.title} title={m.title} tag={m.tag} solve={m.solve} href="/build" />
          ))}
        </div>
      </section>

      {/* two columns: top players + trending SBCs */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader title="Top rated" subtitle="The best players in FC26." action={{ label: "All players", href: "/players" }} />
          <div className="flex flex-col gap-1.5">
            {topPlayers.map((p, i) => (
              <div key={p.id} className="panel flex items-center gap-3 px-3.5 py-2.5">
                <span className="w-4 text-center font-mono text-xs text-[var(--color-faint)]">{i + 1}</span>
                <span className="w-7 font-display text-lg font-extrabold tabular-nums" style={{ color: RARITY[p.rarity].accent }}>
                  {p.rating}
                </span>
                <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                <span className="text-xs text-[var(--color-faint)]">{p.positions[0]}</span>
                <span className="w-16 text-right font-mono text-xs text-[var(--color-muted)]">{formatCoins(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Trending SBCs" subtitle="Solved for the cheapest valid squad." action={{ label: "Open solver", href: "/sbc" }} />
          <div className="flex flex-col gap-2">
            {sbcCosts.map(({ sbc, cost }) => (
              <Link
                key={sbc.id}
                href="/sbc"
                className="panel panel-interactive group flex items-center gap-3 px-4 py-3"
              >
                <Layers className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{sbc.name}</p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-[var(--color-muted)]">
                    <Trophy className="h-3 w-3 text-[var(--color-gold)]" /> {sbc.reward}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-[var(--color-gold)]">{formatCoins(cost)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-faint)]">{sbc.difficulty}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* bargains + league distribution */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader title="Value picks" subtitle="The cheapest 84+ rated players to anchor a budget squad." />
          <div className="grid grid-cols-2 gap-1.5">
            {bargains.map((p) => (
              <div key={p.id} className="panel flex items-center gap-2.5 px-3 py-2">
                <TrendingDown className="h-3.5 w-3.5 shrink-0 text-[var(--color-good)]" />
                <span className="w-6 font-display text-base font-extrabold tabular-nums" style={{ color: RARITY[p.rarity].accent }}>
                  {p.rating}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{p.name}</span>
                <span className="font-mono text-xs text-[var(--color-muted)]">{formatCoins(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Biggest leagues" subtitle="Where the FC26 player pool is deepest." />
          <div className="flex flex-col gap-2.5">
            {leagues.slice(0, 8).map((l) => (
              <div key={l.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs text-[var(--color-muted)]">{l.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${(l.count / maxLeague) * 100}%`, opacity: 0.85 }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-xs tabular-nums text-[var(--color-faint)]">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* market movers + around FUT */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeader title="On the move" subtitle="Biggest estimated price swings today." action={{ label: "Open market", href: "/market" }} />
          <div className="grid gap-1.5">
            {[...up, ...down].map((p) => (
              <MarketRow key={p.id} p={p} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title="Around FUT" subtitle="Live promos and the latest news." action={{ label: "News & promos", href: "/news" }} />
          <div className="flex flex-col gap-2">
            {livePromos.map((p) => (
              <Link key={p.id} href="/news" className="panel panel-interactive flex items-center gap-3 px-4 py-3">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[var(--color-up)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{p.description}</p>
                </div>
                <Badge variant="good">Live</Badge>
              </Link>
            ))}
            {latestNews.map((n) => (
              <Link key={n.id} href="/news" className="panel panel-interactive flex items-center gap-3 px-4 py-3">
                <Badge variant="accent">{n.tag}</Badge>
                <p className="min-w-0 flex-1 truncate text-sm text-[var(--color-fg)]">{n.title}</p>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-faint)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* footer CTA */}
      <section className="mt-16 panel overflow-hidden p-8 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Ready to build?</h2>
            <p className="mt-1.5 max-w-md text-sm text-[var(--color-muted)]">
              Open the builder, drop in players, and let the Gaffer finish the job. No account needed.
            </p>
          </div>
          <Link
            href="/build"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-accent-ink)] transition-all hover:shadow-[0_0_28px_-6px_var(--color-accent-soft)]"
          >
            Open the Builder <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
