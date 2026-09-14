# Task Log: Use Case 1/15 — AI Ad Budget Optimization

**Date:** 2026-09-14
**Module:** ads_management
**Source:** Use Case Build Standard, item 1 (see
`docs/policies/USE_CASE_BUILD_STANDARD.md`)

## What was built

1. Schema: `ad_campaign_metrics` (real per-period metrics) and
   `report_share_tokens` (shared customer-self-service infra). Applied via
   `npx drizzle-kit push`, verified with `sqlite3 .schema`.
2. `lib/db/ad-campaign-metrics-queries.ts` — CRUD + real SQL SUM
   aggregation (`getAggregatedMetricsForAllCampaigns`).
3. `lib/pipelines/ad-budget-optimization-pipeline.ts` — deterministic
   ranking + `classifyBudgetAction` (pure, exported, unit-tested).
4. `lib/agents/ad-budget-optimization-agent.ts` — Ollama-grounded
   narrative, plan→search→act→execute→complete, advisory only.
5. API routes: `metrics/`, `budget-optimization/`,
   `budget-optimization/agentic/`, `share-link/`.
6. `lib/report-share/` — token queries, resolver registry (reusable
   across future use cases), public API route, public page.
7. Admin UI: ManualTab (metrics entry + share-link generation),
   PipelineTab and AgenticTab (budget-optimization sections),
   DashboardTab and ReportTab (both genuinely updated with the new data,
   not just a new isolated page).
8. Tests: `tests/unit/ad-budget-optimization.test.ts` (9 tests — 6 pure
   rule tests, 3 real-DB aggregation tests). Live verification via curl
   against a running dev server (18 manual/pipeline/agentic cases, all
   recorded to `test_execution` via
   `scripts/record-usecase1-ad-budget-optimization-tests.ts`).

## Decisions made

- Customer self-service = shareable token-gated report link, not a
  customer-login portal (none exists in TalentsHill). Built as shared
  infra (`report_share_tokens` + resolver registry) so the next 14 use
  cases reuse it without new tables.
- Playwright was considered, then reverted — checked and confirmed this
  repo already has a real, working test-execution pattern (Vitest +
  `test_execution` DB log + live manual verification); adding a second,
  unfamiliar test framework would have violated "search existing
  patterns before building."
- Budget-reallocation rule is a simple, disclosed threshold rule, not an
  opaque ML score — auditable, and the agent step can only narrate it in
  plain language, never invent it.

## Gaps found and fixed

- A real logic bug: single-campaign case always fell through to "hold"
  regardless of ROAS, due to `idx < floor(n/2)` evaluating false for
  n=1. Fixed to `idx <= floor((n-1)/2)`, regression-tested, and
  reverified live via the agentic route before closing this use case.

## Verification

- `npx tsc --noEmit`: clean.
- `npx vitest run`: 32/32 passed (23 pre-existing + 9 new).
- Live dev server (port 3011): 401 unauthenticated, 201 metrics log, 200
  pipeline + agentic runs with real Ollama narrative, 200/404/410 on the
  public share-link route (valid/bogus/revoked), cascade-delete +
  confirmed-gone cleanup.
- `module_registry.missing_items` updated to disclose what remains
  unbuilt (no live ad-platform sync — metrics are still manually
  entered).

## Status

Done per the Use-Case Build Standard's definition of done. Remaining
gap, disclosed not hidden: no live ad-platform API sync — an admin must
manually log metrics from Google/Meta/LinkedIn's own reporting UI.
