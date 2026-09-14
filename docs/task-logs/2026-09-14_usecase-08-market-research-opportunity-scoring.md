# Task Log: Use Case 8/15 — Market Research Opportunity Scoring

**Date:** 2026-09-14
**Module:** market_research
**Source:** Use Case Build Standard, item 8

## What was built

1. Dispatched a background research agent first to fully map the
   pre-existing `market_research` module (schema, queries, pipeline,
   agent, API routes, UI, RBAC, report-share status, and — critically —
   whether it already supported multi-brief comparison). Confirmed
   zero overlap: everything pre-existing is single-brief-scoped.
2. Schema: 4 new real analyst-input columns (SOM estimate, competition
   level, risk level, strategic fit score) + 2 computed columns
   (opportunity score, rank) on `marketResearchBriefs`. Applied via
   `drizzle-kit push`.
3. `market-opportunity-scoring-pipeline.ts` — pure `computeOpportunityScore`
   + `rankByScore` + the real cross-brief aggregation pipeline.
4. `market-opportunity-scoring-agent.ts` — Ollama recommendation
   narrative, fabrication-guard applied (open-ended reasoning across
   multiple real briefs, not pure number narration).
5. API routes, report-share resolver + public page, admin UI (Manual/
   Pipeline/Agentic/Dashboard/Report tabs all extended).
6. Tests: 9 new Vitest tests (113/113 total). Live: 19 cases recorded
   to `test_execution`, including 1 real Ollama recommendation call
   across 2 real scored briefs plus 1 deliberately-incomplete brief.

## No real bugs found this use case

The existing PATCH route already forwarded the full body to the update
function, so the new opportunity-input fields worked through it with
only a type-signature change — no route code changed.

## Deliberately not built

Automatic market-size estimation (no external data source exists; SOM
is always a real analyst estimate); TAM/SAM breakdown (SOM only, the
smallest and most defensible figure); automatic re-scoring triggers.

## Verification

- `npx tsc --noEmit`: clean throughout.
- `npx vitest run`: 113/113 passed (9 new).
- Live dev server (port 3018): 3 real briefs created, 2 given complete
  real opportunity-scoring inputs, 1 deliberately left incomplete.
  Pipeline computed exact hand-verified scores (82/100 and 72/100),
  correctly skipped the incomplete brief. Real Ollama recommendation
  agent cited only the real titles/scores, zero fabrication warning.
  Dashboard/report KPIs matched hand-computed values exactly. Public
  self-service report and HTML page both verified. All test data
  deleted and confirmed gone via `sqlite3 SELECT COUNT(*)`.
- `module_registry` updated for `market_research` (10 API routes).

## Status

Done per the Use-Case Build Standard's definition of done.
