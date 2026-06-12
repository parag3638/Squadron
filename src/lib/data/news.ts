/**
 * Bundled FC26 promo calendar + news feed (sample content for the hub). Dates
 * are ISO; status is computed against "now". Structured so a real feed can drop
 * in later. Not affiliated with EA Sports.
 */

export type PromoStatus = "live" | "upcoming" | "ended";

export interface Promo {
  id: string;
  name: string;
  type: string;
  description: string;
  start: string;
  end: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  tag: "Promo" | "SBC" | "Evolution" | "Market" | "Ratings";
  date: string;
}

const PROMOS: Promo[] = [
  {
    id: "tots",
    name: "Team of the Season",
    type: "Marquee",
    description: "The best performers of the season get massive upgraded cards, league by league.",
    start: "2026-06-05",
    end: "2026-06-19",
  },
  {
    id: "festival",
    name: "Festival of FUTball",
    type: "Live",
    description: "Objective-driven cards that upgrade as community milestones are hit.",
    start: "2026-06-26",
    end: "2026-07-10",
  },
  {
    id: "summer-heat",
    name: "Summer Heat",
    type: "Promo",
    description: "End-of-year boosted specials to carry your squad into the new title.",
    start: "2026-07-17",
    end: "2026-07-31",
  },
  {
    id: "showdown",
    name: "Showdown Series",
    type: "Promo",
    description: "Paired players from upcoming real-world fixtures — the winner gets an upgrade.",
    start: "2026-05-15",
    end: "2026-05-29",
  },
  {
    id: "path-to-glory",
    name: "Path to Glory",
    type: "Promo",
    description: "Cards that upgraded based on a nation's tournament run.",
    start: "2026-04-24",
    end: "2026-05-08",
  },
];

const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "TOTS Bundesliga squad drops",
    summary: "Stacked attacking options headline the Bundesliga Team of the Season, with several meta-defining fullbacks.",
    tag: "Promo",
    date: "2026-06-12",
  },
  {
    id: "n2",
    title: "New Evolution: Pace Merchant is live",
    summary: "Turn a sub-84 forward into a meta speedster — free, with +2 OVR and +4 pace. Best picks in the Evolutions tab.",
    tag: "Evolution",
    date: "2026-06-11",
  },
  {
    id: "n3",
    title: "85+ Double Upgrade SBC returns",
    summary: "Two 85+ rated players for a moderate outlay. Cheap fodder from your club makes it far better value.",
    tag: "SBC",
    date: "2026-06-10",
  },
  {
    id: "n4",
    title: "Market watch: TOTS attackers cooling off",
    summary: "Prices on release-day attackers are easing as supply rises — risers and fallers tracked on the Market tab.",
    tag: "Market",
    date: "2026-06-09",
  },
  {
    id: "n5",
    title: "Festival of FUTball teased for next week",
    summary: "Objective-based upgradable cards return. Plan your grind around the milestone unlocks.",
    tag: "Promo",
    date: "2026-06-08",
  },
  {
    id: "n6",
    title: "Ratings refresh hits the meta",
    summary: "A handful of in-form players saw live stat bumps, shaking up the best-value rankings.",
    tag: "Ratings",
    date: "2026-06-07",
  },
];

export function promoStatus(p: Promo, now: Date = new Date()): PromoStatus {
  const start = new Date(p.start);
  const end = new Date(p.end);
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "live";
}

const ORDER: Record<PromoStatus, number> = { live: 0, upcoming: 1, ended: 2 };

export function getPromos(now: Date = new Date()): (Promo & { status: PromoStatus })[] {
  return PROMOS.map((p) => ({ ...p, status: promoStatus(p, now) })).sort(
    (a, b) => ORDER[a.status] - ORDER[b.status] || +new Date(b.start) - +new Date(a.start),
  );
}

export function getNews(): NewsItem[] {
  return [...NEWS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
