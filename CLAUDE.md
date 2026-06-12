@AGENTS.md

# FUT26 — project guide

AI Squad Builder & SBC Solver for EA Sports FC 26 Ultimate Team. Next.js 16 (App Router, Turbopack),
React 19, TypeScript, Tailwind v4 (CSS-first tokens in `src/app/globals.css`), Radix + cva
primitives, Motion, Vercel AI SDK v6 + OpenAI. See `README.md` for the full overview.

## Architecture

- **Domain core** (`src/lib/fut/`) is pure and test-driven — `rating.ts`, `chemistry.ts`,
  `formations.ts`, `solver.ts`, `sbc.ts`, `economy.ts`. Change behaviour test-first (`*.test.ts`).
  `calcChemistry` accepts a structural `ChemSlot` so view types work client-side too.
- **SBC solving is optimisation, not the LLM.** `solver.ts` seeds membership/diversity, hill-climbs
  rating with cost-efficient swaps, then improves chemistry — every swap guarded by `structureOk`.
- **Data layer** (`src/lib/data/`) is an in-memory repository over bundled `src/data/players.json`
  behind a storage-agnostic interface (Postgres-swappable later). `getSolverPool` is
  rating-stratified so the solver can reach high targets with cheap anchors.
- **AI** (`src/lib/ai/`) — the OpenAI model orchestrates via tools that call the solver/repos. The chat route
  (`src/app/api/chat/route.ts`) streams with `toUIMessageStreamResponse()`; the client uses
  `useChat` + `DefaultChatTransport`.
- **`solve-service.ts` / `solve-types.ts`** shape solver results into the serialisable `ShapedSolve`
  used by both API routes and the UI pitch. Keep the view types in `solve-types.ts` (no server imports).

## Conventions

- Design tokens are CSS variables (`--color-*`, `--font-display` = Archivo). Numbers use `.tnum` /
  `tabular-nums`. Don't introduce Inter/Space Grotesk — the look is "broadcast noir".
- Prices are estimates, never live — keep that labelled in UI/AI copy.
- `npm test` must stay green (37 tests). `npm run build` must pass before claiming done.
