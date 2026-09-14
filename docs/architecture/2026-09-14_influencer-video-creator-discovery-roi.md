# Architecture: Influencer Creator Discovery & ROI Scoring (influencer_video)

**Use case:** #5 of the 130-item catalog — "Influencer Marketing: Creator
discovery and campaign ROI."

## What already existed

Same starting state as `ads_management` before use case 1: CRUD +
generic readiness score, no performance data, no discovery/ROI/sentiment
logic. Confirmed via research before building (Explore agent), not
assumed.

## New capability: creator discovery

Honest scope: real search/filter over this repo's own creator records
(`searchProspectingCreators`, filtered by platform + minimum
`audienceFitScore`), not a third-party creator-database lookup — no such
integration exists. `audienceFitScore` is a manually-assessed 0-100
field, real human judgment, not a fabricated third-party audience-data
API result.

## New capability: ROI scoring

Mirrors `ads_management`'s budget-optimization pattern exactly:
`influencer_campaign_metrics` (real per-period reach/clicks/sales/
revenue, manually entered), `getRoiAggregateForAllCampaigns()` (real SQL
SUM), `classifyRenewalAction` (pure, unit-tested, same n=1-safe top-half
math already proven necessary in use case 1), `runInfluencerRoiPipeline`
(deterministic), `runInfluencerRoiAgent` (Ollama narrative, grounded
only in real computed numbers).

## New capability: sentiment analysis (real NLP, not fabricated)

`campaignFeedbackNotes` — real, admin-entered qualitative feedback text.
`runInfluencerSentimentAgent` classifies it via a real local Ollama call,
told explicitly to reference only the given text. If no feedback text
exists, it honestly reports `insufficient_data` rather than inventing a
sentiment score — verified live in both branches.

## Real bug found and fixed: audience-fit score silently dropped on create

The Manual tab form sent `audienceFitScore` in the create request; the
existing `POST /api/admin/influencer-video` route destructured only
`influencerName`/`platform` from the body and passed a hand-picked
subset of fields to `createInfluencerCampaign` — never including
`audienceFitScore` or `campaignFeedbackNotes`, even after the query
function's type was widened to accept them. Caught only by live
verification (fetching the created record back and finding the field
null). Fixed by explicitly forwarding both fields in the route.

## Customer self-service

Reused the existing `report_share_tokens`/registry mechanism unchanged.
Unlike `leads`, influencer ROI data (creator name, platform, ROI,
renewal recommendation) is treated as business performance data, not
individual PII — shared in full detail, matching the `ads_management`
pattern rather than the aggregate-only `leads` pattern. Contact email is
never included in the resolver's output.

## Also fixed: stale `api_route_count`

`module_registry.api_route_count` for this module was hardcoded to 8 by
a copy-pasted reconciliation script (`seed-module-registry-build-2026-09-09.ts`)
uniformly across all 8 modules built that day, regardless of actual route
count. This module's actual count at the time (before this use case) was
7, now correctly higher after adding the ROI/sentiment/search/share-link
routes. Corrected in the registry update alongside the missing-items
disclosure, same drift class flagged for `ads_management` in use case 1.
