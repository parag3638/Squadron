# Squadron — AI Squad Builder & SBC Solver

An AI-powered companion for **EA Sports FC 26 (FIFA 26) Ultimate Team**. Build the strongest
squad, solve Squad Building Challenges for the cheapest valid solution, search the full player
database, and ask an AI coach ("The Gaffer") to do it all in plain English.

This is **v1** — the first slice of a larger platform. See `Roadmap` below.

## Features

- **AI Coach (The Gaffer)** — natural-language squad building, SBC coaching, Evolution advice and
  grounded FUT Q&A, powered by OpenAI (GPT) with tool use (streams squads straight onto a pitch).
- **SBC Solver** — a deterministic constraint optimiser that finds the cheapest valid 11 for a
  challenge (rating + chemistry + league/nation/quality requirements), in well under a second.
- **Squad Builder** — an interactive broadcast-style pitch with **live rating & chemistry**, a
  player picker, formation switching, and one-click Auto-build.
- **Player Database** — all FC26 players, filterable by position, league, nation, rating and price.

## How it works

The core insight: **SBC solving is constraint optimisation, not an LLM task.** A deterministic
solver (`src/lib/fut/solver.ts`) does the math; **the LLM orchestrates** via tools
(`src/lib/ai/tools.ts`) — turning "build a cheap 84 Premier League squad" into a solver call and
coaching on the result.

```
src/lib/fut/        domain core (pure, test-driven)
  rating.ts         EA squad-rating formula (average + excess bonus)
  chemistry.ts      FC24+ chemistry (0–3 per player, in-position links, /33)
  formations.ts     formations + pitch coordinates
  solver.ts         cost-minimising constraint solver (seed → rating climb → chem swaps)
  sbc.ts            SBC constraint model + evaluator
  economy.ts        rarity + estimated-price model
src/lib/data/       repositories over the bundled dataset (in-memory; Postgres-swappable)
src/lib/ai/         OpenAI model, grounded system prompt, tools
src/app/api/        chat (streaming + tools), solve, players, sbcs
src/components/      UI — the pitch, custom player cards, coach, builder, search
```

**Data:** the bundled `src/data/players.json` is derived from an open FC26 dataset (sofifa-sourced
base ratings) via `scripts/import-players.ts`. Prices are a deterministic **estimate** (clearly
labelled), not the live market. A FutDB client (`src/lib/data/futdb.ts`) is wired in for live
prices/SBCs when a key is provided.

> Not affiliated with EA Sports. No EA accounts or live servers are accessed — third-party/open data only.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The builder, solver and search work out of the box. The **AI Coach** needs an OpenAI key.

### Environment variables

Create `.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | for AI coach | Powers the Gaffer. Get one at https://platform.openai.com/api-keys |
| `FUT_AI_MODEL` | optional | OpenAI model (default `gpt-4o`; try `gpt-4o-mini` for speed/cost) |
| `FUTDB_API_KEY` | optional | Live FC26 prices/SBCs via https://www.futdatabase.com/ |

### Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm test             # vitest (domain core, solver, integration) — 37 tests
npm run import:data  # regenerate src/data/players.json from /tmp/fc26_players.csv
```

To refresh the dataset, download the source CSV (e.g. from the
[EAFC26-DataHub](https://github.com/ismailoksuz/EAFC26-DataHub) `data/players.csv`) to
`/tmp/fc26_players.csv`, then run `npm run import:data`.

## Deploy

Zero-config on **Vercel** — import the repo and add `OPENAI_API_KEY`. The bundled dataset means
no database is required for v1.

## Roadmap

v1 is the Squad Builder + SBC Solver. Each future phase plugs into existing seams:

- **Phase 2** — Accounts + owned-player support (the solver already accepts a candidate pool).
- **Phase 3** — Market & trading insights ("best buys / what to sell") over the price layer.
- **Phase 4** — News & promo hub with AI summaries.

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Radix · Motion · Vercel AI SDK +
OpenAI · Vitest.
