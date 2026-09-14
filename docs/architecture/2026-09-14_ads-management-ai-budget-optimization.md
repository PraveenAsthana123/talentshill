# Architecture: AI Ad Budget Optimization (ads_management)

**Use case:** #1 of the 130-item catalog in
`/mnt/deepa/sohamyoga/docs/chatgpt-extracts/2026-09-13_affiliate-performance-marketing-and-9-vertical-playbooks.md`
(consolidates marketing-type use cases 1 Performance Marketing, 7 Paid
Search/PPC, 8 Paid Social — all three shared the `ads_management` module
and the same underlying need: turn ad spend into a budget recommendation).

## Problem

`ads_management` had CRUD + a single-campaign readiness score, but no
cross-campaign performance data and no optimization logic — nothing to
recommend where budget should actually go.

## Data flow

```
Admin logs real metrics (Manual tab)
        │
        ▼
ad_campaign_metrics (new table, one row per period per campaign)
        │
        ▼  real SQL SUM/GROUP BY
getAggregatedMetricsForAllCampaigns()  →  CampaignAggregate[] (ROAS/CPA/CTR)
        │
        ▼
runAdBudgetOptimizationPipeline()  →  rank by ROAS → classifyBudgetAction()
        │                                                   (pure, unit-tested)
        ├─→ Pipeline tab: stage-by-stage table
        │
        ▼
runAdBudgetOptimizationAgent()  →  Ollama narrative, grounded only in
        │                          the pipeline's real numbers
        ▼
Agentic tab: narrative + Dashboard/Report tabs: aggregate + per-campaign
        │
        ▼
report_share_tokens (new, shared table) → /report/[token] → customer
        self-service, no admin login required
```

## New schema

- `ad_campaign_metrics`: manually-entered impressions/clicks/conversions/
  revenue/spend per campaign per period. No ad-platform API sync exists
  (same honesty boundary as `ad_campaigns.spend`) — disclosed in the
  Manual tab copy, not hidden.
- `report_share_tokens`: shared across every future use case, not
  ads_management-specific. Opaque 256-bit token (`crypto.randomBytes(32)`
  base64url), revocable, optionally expiring. Public routes never accept
  an admin session as a substitute for a valid token.

## Decision rule (deterministic, not a black box)

`classifyBudgetAction()` in `lib/pipelines/ad-budget-optimization-pipeline.ts`
is a pure, exported, unit-tested function:
- ROAS < 1.0 → decrease 20%
- ROAS ≥ 1.0 and ranked in the top half of scored campaigns
  (`rank <= floor((n-1)/2)`, so a single profitable campaign qualifies) →
  increase 15%
- else → hold

A live bug was caught and fixed during this build: the original top-half
math (`idx < floor(n/2)`) evaluated to "hold" for every single-campaign
case regardless of ROAS, because `floor(1/2) = 0` and no index is `< 0`.
Fixed to `idx <= floor((n-1)/2)`. Covered by a regression test
(`ad-budget-optimization.test.ts`, "boundary: n=1").

## Why a pure function, not DB-integrated rank tests

The dev database is shared and already contains real campaigns from
earlier module builds. A test asserting "the highest-ROAS campaign among
N total gets `increase`" is flaky if N depends on whatever else exists in
the DB at test time. `classifyBudgetAction(campaign, idx, totalScored)`
is tested directly with controlled `idx`/`totalScored` inputs — still the
exact function the pipeline calls, not a mock, just decoupled from
uncontrolled shared state. Real-DB aggregation math (SUM, entry exclusion)
is tested separately, against real inserted rows, since that's genuinely
DB-dependent logic worth verifying against real SQL.

## Advisory-only boundary

Neither the pipeline nor the agent writes a reallocated budget back to
`ad_campaigns.budget`. The agent's system prompt explicitly forbids
inventing campaigns/numbers not in its grounding table (same pattern as
`ad-campaign-readiness-agent.ts`). This was verified live: the narrative
referenced only the real campaign name and ROAS value it was given.
