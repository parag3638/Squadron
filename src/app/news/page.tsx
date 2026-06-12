import { CalendarDays, Dot } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { SectionHeader } from "@/components/site/Section";
import { NewsDigest } from "@/components/news/NewsDigest";
import { getPromos, getNews, type PromoStatus } from "@/lib/data/news";

export const metadata = { title: "News & Promos · Squadron" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const STATUS: Record<PromoStatus, { variant: "good" | "accent" | "default"; label: string }> = {
  live: { variant: "good", label: "Live" },
  upcoming: { variant: "accent", label: "Upcoming" },
  ended: { variant: "default", label: "Ended" },
};

export default function NewsPage() {
  const promos = getPromos();
  const news = getNews();

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">News & Promos</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          The FC26 promo calendar and the latest around Ultimate Team. Sample content — wire a live feed later.
        </p>
      </header>

      <NewsDigest />

      {/* promo calendar */}
      <section className="mt-10">
        <SectionHeader title="Promo calendar" subtitle="What's live, what's next, what just ended." />
        <div className="flex flex-col gap-2.5">
          {promos.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-4 panel p-4"
            >
              <span
                className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  p.status === "live"
                    ? "bg-[var(--color-good)]/12 text-[var(--color-good)]"
                    : p.status === "upcoming"
                      ? "bg-[var(--color-accent)]/12 text-[var(--color-accent)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-faint)]"
                }`}
              >
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-bold">{p.name}</h3>
                  <Badge variant={STATUS[p.status].variant}>{STATUS[p.status].label}</Badge>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-faint)]">{p.type}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{p.description}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-[var(--color-faint)]">
                {fmt(p.start)} – {fmt(p.end)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* news feed */}
      <section className="mt-12">
        <SectionHeader title="Latest news" />
        <div className="grid gap-3 sm:grid-cols-2">
          {news.map((n) => (
            <article key={n.id} className="panel p-5">
              <div className="flex items-center gap-2 text-[11px] text-[var(--color-faint)]">
                <Badge variant="accent">{n.tag}</Badge>
                <Dot className="h-3 w-3" />
                {fmt(n.date)}
              </div>
              <h3 className="mt-2.5 font-display text-base font-bold leading-snug">{n.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{n.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
