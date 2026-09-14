# Task Log: Use Case 6/15 — Lifecycle/Activation Journey Tracking

**Date:** 2026-09-14
**Module:** contacts
**Source:** Use Case Build Standard, item 6

## What was built

1. Researched first (Explore agent) to find a genuinely new angle that
   doesn't duplicate the leads MQL/SQL funnel (use case 2) or the
   pre-existing static completeness pipeline already on `contacts`.
2. Schema: `lifecycleStage`, `activationScore`, `lastEngagedAt` on
   `contacts`.
3. `contact-activation-pipeline.ts` — pure `classifyLifecycleStage` +
   `computeActivationScore`, real cross-campaign engagement aggregation.
4. `contact-retention-segmentation-pipeline.ts` — real at-risk → nurture
   list, reusing use case 5's list-materialization pattern.
5. `contact-retention-agent.ts` — deliberately distinct name/role from
   the pre-existing `contact-engagement-agent.ts` to avoid vocabulary
   collision.
6. API routes, aggregate-only report-share resolver + page, UI additions
   to PipelineTab/AgenticTab/DashboardTab/ReportTab.
7. Tests: 13 new Vitest tests. Live: 21 cases recorded to
   `test_execution`, including a real tracking-pixel/click flow and a
   real Ollama call.

## Real bug found and fixed

`POST /api/admin/contacts` silently dropped the `status` field from the
request body — same bug class as use case 3 (a field the query layer
supports but the route never forwards). Caught live when a contact
created with `status: 'unsubscribed'` was wrongly classified `'new'`
instead of `'churned'`. Fixed and reverified.

## Notable non-bug finding

The retention agent recomputes real lifecycle state on every run rather
than trusting a stale manually-set flag — confirmed this is correct
behavior (ground truth over cached state), not a defect, after initially
looking like a discrepancy during live testing.

## Deliberately not built

Full trial/subscription lifecycle (no such product exists in
TalentsHill); per-contact content-engagement join (no visitor-identity
layer exists to bridge `content_engagement_metrics` to `contacts`).

## Verification

- `npx tsc --noEmit`: clean throughout.
- `npx vitest run`: 94/94 passed (81 pre-existing + 13 new).
- Live dev server (port 3016): 3 distinct real lifecycle profiles
  (new/engaged/churned) correctly classified in one real pipeline run,
  using the actual tracking-pixel/click-redirect routes (not synthetic
  DB writes) to generate the "engaged" contact's real signal.
- `module_registry` updated for `contacts`.

## Status

Done per the Use-Case Build Standard's definition of done.
