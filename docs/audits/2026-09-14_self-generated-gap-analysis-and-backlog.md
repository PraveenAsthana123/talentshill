# TalentsHill Self-Generated Gap Analysis & Backlog — 2026-09-14

## Provenance

No ChatGPT roadmap conversation was extracted for this audit (unlike SohamYoga's
`docs/chatgpt-extracts/2026-09-14_marketing-greeting-exchange-soham-roadmap.md`, whose 30-item
distilled backlog was already validated as a comprehensive marketing-agency-platform capability
list). Per explicit user instruction, this backlog is self-generated: the same 30-capability list
was checked against TalentsHill's real, current codebase via `grep`/file reads (not assumption),
then extended with one TalentsHill-specific item (#31, B2B ABM) that SohamYoga's pure-B2C model
did not need.

## Method

Full read of `lib/db/schema.ts` (1,980 lines), all 16 `docs/architecture/*.md` files, and targeted
`grep -r` sweeps across `lib/` and `app/` for each capability's key terms. Every verdict below is
grep/read-confirmed against real files — no table or pipeline was assumed to exist or not exist
from its name alone.

## B2B context

TalentsHill is a B2B agency/consultancy (`app/solutions/*`, `app/industries`, `app/services`,
`app/book`, `contactSubmissions.company/budgetRange/industry/role`) selling AI-strategy/GenAI/
digital-marketing/robotics services to other businesses (banking, healthcare, manufacturing,
retail, etc.) — unlike SohamYoga's pure B2C model. This makes a real **B2B ABM Engine**
(named-account rollup, multi-stakeholder buying-committee mapping) a genuine, currently-missing
gap, added below as item #31. **Shopify-style commerce integration** (item #27 on the original
30-item list) remains genuinely not-applicable here too — confirmed zero product/order/cart/SKU
tables in the schema; TalentsHill sells services via lead-gen + booking, not e-commerce.

## Findings

| # | Capability | Verdict | Evidence | Gap |
|---|---|---|---|---|
| 1 | Evidence Ledger | NOT_BUILT | grep for FACT/ESTIMATE/INFERENCE/HYPOTHESIS/UNKNOWN: 0 hits | No claim-classification/traceability system |
| 2 | KPI Engine | NOT_BUILT | Only per-module dashboards + `analytics-health-pipeline.ts` (email-only, no confidence/sample-size fields) | No cross-cutting explainable KPI-dimension engine |
| 3 | Opportunity & Benchmark Engine | NOT_BUILT | `market-opportunity-scoring-pipeline.ts` scores analyst-authored new-business ideas, not gaps vs. owned KPIs | No gap-ranking-to-module-remediation engine |
| 4 | Competitor Benchmark Engine | PARTIAL | `competitor_analysis` + `competitor_campaign_observations` tables, real admin UI | Qualitative + dated observations only; no structured multi-dimension numeric scoring |
| 5 | Audience Intelligence / Segments | ALREADY_BUILT | `app/admin/marketing/segments/`, `lib/crm/segment-evaluator.ts`, `lists`/`list_members`, 2 real segmentation pipelines | None |
| 6 | Lead Scoring + Next-Best-Action | PARTIAL | `lib/contact/lead-scoring.ts` real per-factor breakdown, `lead-qualification-agent.ts` free-text narrative | No structured/stored deterministic next-best-action field |
| 7 | Growth Readiness Score | PARTIAL | `analytics-health-pipeline.ts` composite, but email/contact-program scoped only | No company-wide roll-up across all 15 modules |
| 8 | Business Diagnostic | NOT_BUILT | grep "demand map"/"funnel constraint": 0 hits | Neither Demand Map nor Funnel Constraint exists |
| 9 | GEO Visibility | NOT_BUILT | "GEO"/"answer engine" only in marketing copy (`app/solutions/seo-geo/`) | No admin-observed AI-answer-engine mention tracking |
| 10 | CRO / Website Friction Engine | NOT_BUILT | grep "friction": 0 relevant hits | No friction-finding log or readiness score |
| 11 | Channel Attribution | PARTIAL | `contacts.source` enum + `shareLinks` UTM fields capture raw origin | No cross-channel dedup or conversion-rate-by-channel rollup |
| 12 | Voice AI call-log + qualification | ALREADY_BUILT | `voice_call_logs`, `voice-call-qualification-pipeline.ts` (real BANT scoring) | None |
| 13 | Video Growth Engine (script + render) | NOT_BUILT | `video_projects`/`video_clip_plans` are disclosed planning-only; no script-gen agent, no renderer | Neither exists |
| 14 | Pre-Sales Growth Brief | NOT_BUILT | No composer file; depends on #1-#3 | Not buildable until #1-#3 exist |
| 15 | Research-Depth Router | NOT_BUILT | grep prefilter/research-depth-router: 0 hits | No pre-AI-call cost-gating router |
| 16 | Demo Recommendation Engine | NOT_BUILT | No opportunity→module mapper | — |
| 17 | Sales Copilot talking points | NOT_BUILT | grep "talking points": 0 hits | — |
| 18 | Growth Scenario Simulator | NOT_BUILT | grep scenario/compound-projection: 0 hits | — |
| 19 | Demo Catalog Portal | PARTIAL | `app/demo/page.tsx` + `DEMO_ITEMS` — real public catalog of generic solution demos | Not specific to TalentsHill's own 15 live-verified modules; `module_registry` is admin-only, not client-facing |
| 20/21 | Vertical Pack / Vertical KPI Registry | NOT_BUILT | `industries` table models industries TalentsHill sells **into**, not its own vertical | No self-classification or vertical KPI list |
| 22 | Case Study Engine | NOT_BUILT | `fabrication-guard.ts` blocks the LLM from inventing fake case studies (safety guard only); no `case_studies` table | No evidence-gated case-study entity |
| 23 | Golden Path Registry | NOT_BUILT | 16 architecture docs are static markdown, not DB-backed; grep "golden path": 0 hits | No queryable end-to-end-flow registry |
| 24 | Repo-Truth / Module Registry Drift Audit | ALREADY_BUILT | `module_registry` + `module-registry-drift-pipeline.ts` (4-check) + `module-registry-drift-agent.ts` + admin UI | Minor: on-demand only, not yet cron-scheduled (disclosed in code) |
| 25 | Provider Status | ALREADY_BUILT | `integrations`/`integration_accounts`/`integration_logs`, real 4-factor readiness pipeline | None |
| 26 | Partner Ecosystem tracking | NOT_BUILT | No B2B co-marketing/partner table; "partner" hits are all influencer-creator language | — |
| 27 | Commerce Product Intelligence | NOT_APPLICABLE | Zero product/order/cart/SKU tables; `services` is a static menu | No commerce domain in this business model — documented, not built (same treatment as Shopify exclusion for SohamYoga) |
| 28 | Positioning Statement | NOT_BUILT | grep "For X who Y": 0 hits | No admin-authored positioning template |
| 29 | PMF + Activation Tracking | PARTIAL | `contacts.lifecycleStage`/`activationScore` real behavioral computation | `survey_responses`/`scoring.ts` is an AI-maturity lead-magnet quiz, not Sean-Ellis PMF; no PMF-specific schema |
| 30 | PR & Earned Media | NOT_BUILT | `brand_mentions` is social/review/news sentiment, not PR-specific; no share-of-voice computation | No media-mention log or share-of-voice metric |
| 31 | B2B ABM Engine (new, TalentsHill-specific) | NOT_BUILT | `contacts`/`contactSubmissions` model individuals; no company/account-level rollup | No named-account or buying-committee view — real gap given TalentsHill's actual B2B model |

## Backlog

25 build items (19 NOT_BUILT + 6 PARTIAL extensions + 1 new B2B-specific item), sequenced so
composer items (#14 Growth Brief, #7 company-wide Growth Readiness) are built after their real
dependencies (#1 Evidence Ledger, #2 KPI Engine, #3 Opportunity Engine). 4 items already real
(#5, #12, #24, #25) need no work. 1 item (#27) is documented NOT_APPLICABLE, not built, matching
the same honest-exclusion treatment SohamYoga gave Shopify integration.

Registered into the real `module_registry` table (SQLite/Drizzle) via
`scripts/seed-talentshill-gap-backlog-registry.ts`, `sourceDoc` pointing to this file — same
durable-tracking pattern used for the SohamYoga 30-item backlog.
