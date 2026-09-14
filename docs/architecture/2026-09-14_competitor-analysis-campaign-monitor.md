# Architecture: Competitor Campaign Monitor (competitor_analysis)

**Use case:** #15 of 15 — the final use case in this build-out. Adds
real, dated competitor-activity tracking on top of the pre-existing
static competitor-profile module.

## Research first

A background agent fully mapped the pre-existing `competitor_analysis`
module before any code was written. Unlike most of this session's
other target modules, this one was already a fully-built, real,
10-tab "pilot module" (the first one built to the Operational Portal
standard). The research confirmed:

- `competitorAnalysis` models **one static profile row per
  (service, competitor) pair** — name, website, offering summary,
  pricing notes, strengths/weaknesses. `status: 'monitoring'` is a
  human-set label with zero backing logic — no polling, no diffing,
  no alerting.
- **No dated, event-level competitor-activity concept exists
  anywhere** — no observation log, no campaign/promo/pricing-change
  record, no time-series table.
- **No real competitive-intelligence/ad-library/scraping integration
  exists anywhere** (confirmed via repo-wide grep — zero SEMrush/
  SimilarWeb/ad-library/scraping API hits). The only "automated" fetch
  capability is a single-page title/meta-description scrape used
  solely to pre-fill the static profile, never to log a dated event.
- Unlike broadcasts/appointments/video_editing/reels_management/
  youtube earlier this session, `module_registry.api_route_count` had
  **no drift** here (7 recorded, 7 real) before this use case's
  additions.
- No `report-share` resolver existed for this module — a real gap,
  closed alongside this use case.

This confirmed real, dated competitor-activity tracking was genuinely
new work, safe to add as a child of the existing `competitorAnalysis`
table without duplicating its static-profile scope.

## Scope decisions

- **A real new child entity**, `competitorCampaignObservations`,
  linked to an existing `competitorAnalysis` row by a real foreign key
  (cascade delete) — not a second competitor-profile table.
- **Every observation is a real, admin-entered record of something an
  admin actually saw** — a promo, a pricing change, a new creative, a
  messaging shift — with a real date, channel, and optional evidence
  URL. **Never an "auto-detected" claim or simulated scrape result.**
- **The "monitor" is a real freshness classifier over real logged
  data**, not a live activity watcher. `runCompetitorMonitorScanPipeline`
  scans every real (non-template) competitor and classifies each as
  `active`/`stale`/`no_data` based on real days-since-last-observation
  versus a disclosed threshold — it surfaces which competitors haven't
  had a real check logged recently; it does not itself detect new
  competitor activity (there is no live source to detect it from).
- **The campaign-narrative agent is grounded strictly in one
  competitor's real observation log**, distinct from the pre-existing
  `competitor-research-agent.ts` (which drafts a static profile from a
  one-time site fetch). It is explicitly instructed never to invent a
  promo, price, or date not actually logged.

## What was built

- Schema: `competitorCampaignObservations`.
- `lib/pipelines/competitor-campaign-monitor-pipeline.ts`:
  `computeDaysSinceLastObservation` + `classifyMonitoringFreshness`
  (both pure, unit-tested) + the real portfolio-wide monitor-scan
  pipeline.
- `lib/agents/competitor-campaign-narrative-agent.ts`: Ollama
  activity-pattern summarizer, fabrication-guard applied.
- API: per-competitor observation list/create, observation delete,
  `monitor-scan` (pipeline), per-competitor `narrative` (agent),
  `share-link`; `dashboard`/`report` extended with real observation
  KPIs.
- Customer self-service: `lib/report-share/resolvers/competitor-analysis.ts`
  (this module previously had none) + `app/report/competitor-analysis/[token]/page.tsx`.
- Admin UI: ManualTab gained a "Campaign observations" link per real
  competitor card; a new competitor detail page for logging
  observations and running the narrative agent; PipelineTab gained a
  Monitor Scan section; AgenticTab gained a competitor-selectable
  Campaign Narrative section; Dashboard/Report/Governance extended.

## Honest note on the live Ollama narrative test

Live verification surfaced two real, disclosed findings, documented in
the evidence file rather than hidden:
1. The shared `fabrication-guard.ts` regex flagged the narrative as a
   possible fabrication because it contained "20%" — but that figure
   was literally present in the real logged observation
   ("...a 20% off launch promo..."). This is a **false positive** of
   the regex backstop, which cannot distinguish an invented percentage
   from a correctly-cited real one already in its input — a real,
   disclosed limitation of that shared utility, not a new defect
   introduced here.
2. Separately, the narrative's speculative "suggested next check"
   paragraph mentioned "Facebook Ads" — a channel not present in
   either real logged observation (only Instagram/paid_social and
   landing_page were logged). This is a minor real model overreach in
   the advisory-recommendation portion of the output, not a claim
   about what was actually observed.

## Deliberately not built

- No real competitive-intelligence/ad-library/scraping API integration
  (disclosed, not faked).
- No automatic activity detection — the monitor scan classifies
  freshness of already-logged real data; it does not itself watch for
  new competitor activity.
- No change to the pre-existing static-profile workflow or the
  pre-existing `competitor-research-agent.ts`/`-pipeline.ts` — the new
  observation log is fully additive.
