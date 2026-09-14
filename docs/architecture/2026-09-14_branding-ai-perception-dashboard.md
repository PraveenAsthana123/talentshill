# Architecture: AI Brand Perception Dashboard (branding)

**Use case:** #18 of the 130-item catalog — "AI brand perception
dashboard: collect social/review/news/survey data → sentiment/topics →
competitor benchmark → brand health score → campaign → measure lift."

## Scope decisions

- **`brandAssets` was the wrong table to extend** (research confirmed:
  it's an asset library — logos/guideline docs — with no sentiment/
  perception fields). Built two new tables instead: `brandMentions`
  (real, manually-entered excerpts) and `brandHealthSnapshots`
  (point-in-time aggregates).
- **"Collect data" = real manual entry, not a fake integration.** No
  social-listening/news/review-platform API exists in this environment.
  An analyst logs a real excerpt they've actually read, same honesty
  pattern as every other "no third-party data source" disclosure this
  session (ad-platform sync, creator-database lookup, etc.).
- **Competitor benchmark reuses `competitor_analysis` as a real count**
  (`competitorsTracked`), not a fabricated brand-vs-competitor numeric
  score — research confirmed that table tracks competitors' own
  attributes only, with no structural support for a real comparison
  score. Building a fake one would have violated the no-fabrication
  discipline; an honest count is reported alongside instead.
- **Campaign lift is a real diff between two real snapshots**, both
  requiring a human to actually take them (tagged to the same
  `campaignId`, one before and one after) — not automatic, since nothing
  in this codebase can detect "the campaign just started/ended" itself.

## What was built

- `brand-mention-sentiment-agent.ts`: real NLP on real excerpt text
  (same pattern as `influencer-sentiment-agent.ts`, use case 3) —
  classifies sentiment and extracts topics, never invents mention
  content.
- `brand-health-pipeline.ts`: `computeHealthScore` (pure, unit-tested,
  `round(((positive-negative)/scored + 1) / 2 * 100)`, null with no
  scored data) + `computeCampaignLift` (pure diff of two real snapshots)
  + the deterministic pipeline that aggregates real scored mentions and
  writes a real snapshot.
- `brand-health-agent.ts`: Ollama narrative over the real computed
  snapshot — pure narration of already-computed numbers, so the shared
  `fabrication-guard.ts` backstop wasn't needed here (unlike the mention-
  sentiment classification and content-factory generation tasks, which
  produce open-ended text).
- Customer self-service: resolver returning the last 5 real snapshots
  (score/counts/label), no mention text or PII.

## Naming/vocabulary note

Named the new agents/pipelines around "brand health"/"brand mention
sentiment" rather than reusing "brand" + "engagement"/"readiness" — the
pre-existing `brand-asset-readiness-agent.ts` already owns that
vocabulary for the asset-completeness score, kept deliberately separate.

## Deliberately not built

- No real social-listening/news/review-platform integration (disclosed,
  not faked) — mentions are manually logged.
- No numeric brand-vs-competitor score — `competitor_analysis` data
  doesn't structurally support one; only an honest tracked-count is
  reported.
- Topic-level aggregation across mentions (the sentiment agent extracts
  topics per-mention, but nothing rolls them up into a cross-mention
  topic-trend view) — out of scope for this pass, a real next step if
  mention volume grows.
