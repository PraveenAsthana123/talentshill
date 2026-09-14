# Architecture: Market Research Opportunity Scoring (market_research)

**Use case:** #8 of the Use-Case Build Standard build-out — "score and
rank multiple market-research opportunities against each other" —
distinct from the existing single-brief readiness pipeline (generic
completeness score) and synthesis agent (single-brief text synthesis).

## Research first

A background agent mapped the entire pre-existing `market_research`
module before any code was written. It confirmed:

- The existing `marketResearchBriefs` schema, queries, pipeline
  (`market-research-readiness-pipeline.ts`), and agent
  (`market-research-synthesis-agent.ts`) are all scoped to exactly
  **one brief at a time** — no comparison, ranking, or aggregation
  across briefs exists anywhere in the codebase.
- A repo-wide grep for opportunity-scoring/TAM/SAM/SOM/market-sizing/
  GTM terms found zero implementation hits — only a marketing-page
  card listing "Market Sizing (TAM/SAM/SOM)" as an unbuilt capability,
  and a Governance-tab mention of "market sizes" as a named
  hallucination risk (not a feature).
- No report-share resolver existed for this module.

This confirmed Opportunity Scoring was genuinely new, non-duplicative
work.

## Scope decisions

- **Every scoring input is real and analyst-entered, never estimated
  by an agent.** `somEstimateUsd` (Serviceable Obtainable Market,
  USD), `competitionLevel`, `riskLevel`, and `strategicFitScore`
  (0-100) are all typed columns an analyst fills in via the Manual
  tab's new "Opportunity Inputs" inline form. No AI model ever infers
  a market size, competition level, or risk level — that would be
  exactly the kind of fabricated-statistic risk this session has
  repeatedly guarded against.
- **The composite score is a fixed, disclosed, deterministic formula**
  (`computeOpportunityScore`, pure and unit-tested): SOM tier (0-40,
  bucketed at $10k/$100k/$1M) + competition (0-30, low competition
  scores highest) + risk (0-15, low risk scores highest) + strategic
  fit (0-15, linearly scaled from the analyst's 0-100 input). No LLM
  touches this calculation.
- **Ranking is dense competition ranking** (`rankByScore`, pure and
  unit-tested) — ties share a rank rather than an arbitrary tiebreak.
- **Briefs missing any real input are skipped, never defaulted.** The
  pipeline reports `skippedCount` explicitly rather than silently
  omitting them or guessing a placeholder score.
- **The recommendation agent compares real ranked briefs**, not raw
  numbers in isolation — genuinely open-ended reasoning (unlike
  `brand-health-agent.ts`'s pure number narration), so the shared
  `fabrication-guard.ts` backstop is applied here, same discipline as
  `content-generation-agent.ts` after phi4-mini was caught fabricating
  statistics in use case 4.

## What was built

- Schema: `somEstimateUsd`, `competitionLevel`, `riskLevel`,
  `strategicFitScore` (real inputs) + `opportunityScore`,
  `opportunityRank` (computed) added to `marketResearchBriefs`.
- `lib/pipelines/market-opportunity-scoring-pipeline.ts`:
  `computeOpportunityScore` + `rankByScore` (pure, unit-tested) +
  `runMarketOpportunityScoringPipeline` (real cross-brief aggregation,
  writes score+rank back to every scorable row).
- `lib/agents/market-opportunity-scoring-agent.ts`: Ollama
  recommendation narrative over the real ranked list, fabrication-guard
  applied.
- API: `opportunity-scoring/route.ts` (pipeline),
  `opportunity-scoring/agentic/route.ts` (agent), `share-link/route.ts`;
  `dashboard` and `report` routes extended with real opportunity KPIs
  and the full ranking table.
- Customer self-service: `lib/report-share/resolvers/market-research.ts`
  (business data — titles/scores/real inputs, not PII, same tier as
  campaigns/content/branding) + `app/report/market-research/[token]/page.tsx`.
- Admin UI: ManualTab gained an inline "Opportunity Inputs" edit form
  per brief (the module previously had create+delete only, no edit
  path at all) plus opportunity score/rank columns; PipelineTab gained
  a portfolio-wide "Opportunity Scoring & Ranking" section distinct
  from the existing per-brief readiness section; AgenticTab gained an
  "Opportunity Recommendation" section; DashboardTab and ReportTab
  extended with real opportunity-scoring coverage and the ranking
  table.

## No real bugs found in pre-existing code this use case

The `PATCH /api/admin/market-research/[id]` route already forwarded
the entire request body straight to `updateMarketResearchBrief`
(`updateMarketResearchBrief(id, body)`), so no field-forwarding fix
was needed there — the type signature only needed the new fields added
to its `Partial<>` parameter type.

## Deliberately not built

- No automatic market-size estimation from any external data source —
  no such source exists in this environment; SOM is always a real
  analyst estimate, disclosed as such on the customer-facing report.
- No TAM/SAM breakdown, only SOM — the smallest, most defensible
  market-sizing figure was chosen deliberately to avoid the larger,
  harder-to-substantiate TAM/SAM numbers becoming a fabrication
  surface with no real supporting methodology in this codebase.
- No automatic "when to re-score" trigger — an analyst runs Opportunity
  Scoring manually via the Pipeline tab after entering/updating inputs.
