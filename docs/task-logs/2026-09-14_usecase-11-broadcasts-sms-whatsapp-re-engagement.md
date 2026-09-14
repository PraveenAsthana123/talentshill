# Task Log: Use Case 11/15 — SMS/WhatsApp Event-Triggered Re-engagement

**Date:** 2026-09-14
**Module:** broadcasts
**Source:** Use Case Build Standard, item 11

## What was built

1. Dispatched a background research agent first to fully map the
   pre-existing `broadcasts` module. Confirmed it is email-only (real
   SMTP send), no SMS/WhatsApp integration exists anywhere (the one
   "WhatsApp" file is a hardcoded fake stub), and no event-triggered
   automation exists in this codebase at all.
2. Schema: new `reEngagementMessages` table.
3. `re-engagement-trigger-pipeline.ts` — pure eligibility/
   personalization functions + the real pipeline evaluating every
   real at-risk contact against a real disclosed condition.
4. `re-engagement-message-agent.ts` — real Ollama message-drafting
   agent grounded in real aggregate stats, fabrication-guard applied.
5. API routes, report-share resolver + public page, admin UI (Manual
   log table, Pipeline trigger form, Agentic drafter, Dashboard/
   Report/Governance all extended).
6. Tests: 13 new Vitest tests (138/138 total). Live: 23 cases
   recorded to `test_execution`, including 1 real Ollama draft call
   and a full 3-contact eligible/no-phone/not-at-risk scenario with a
   verified cooldown re-run.

## Also corrected a stale registry field

`module_registry.api_route_count` for `broadcasts` was recorded as 2;
the real route-file count is 7 pre-existing + 4 new = 11. Corrected as
part of this use case's registry update rather than left stale.

## Deliberately not built

Real SMS/WhatsApp gateway integration (disclosed, not faked); a
continuously-polling background scheduler (no cron infrastructure
exists anywhere in this codebase; the trigger runs on demand like
every other pipeline this session); merging with the pre-existing
email-only broadcast send path.

## Verification

- `npx tsc --noEmit`: clean throughout.
- `npx vitest run`: 138/138 passed (13 new).
- Live dev server (port 3021): 3 real contacts created (eligible
  at-risk-with-phone, at-risk-no-phone, engaged-not-at-risk). Trigger
  correctly scored atRiskCount=2, triggered=1, skipped=1, with the
  engaged contact correctly excluded from consideration entirely. The
  logged message had the exact real personalized body and real phone
  snapshot. A second immediate run correctly cooldown-blocked the
  already-messaged contact (triggeredCount=0). Real Ollama draft
  agent correctly avoided fabricating a discount/offer. Dashboard/
  report KPIs and the aggregate-only public report all verified. All
  test data (3 contacts, 1 message, 1 share token) deleted and
  confirmed gone via `sqlite3 SELECT COUNT(*)`.
- `module_registry` updated for `broadcasts` (11 API routes, stale
  count corrected).

## Status

Done per the Use-Case Build Standard's definition of done.
