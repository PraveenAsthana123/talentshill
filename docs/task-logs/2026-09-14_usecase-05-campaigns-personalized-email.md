# Task Log: Use Case 5/15 — AI Personalized Email Campaigns

**Date:** 2026-09-14
**Module:** campaigns (+ templates, lists, contacts substrate)
**Source:** Use Case Build Standard, item 5

## Why this use case took materially longer than the previous four

Research surfaced that the email/campaign system, while extensive
(7 admin modules, full schema for opens/clicks/variants/segments), had
its actual send path silently broken in three independent ways. Adding
AI-generated content on top of a pipeline that couldn't really send,
track, or A/B test anything would have been building on a fake
foundation. Fixed the real gaps first (see architecture note for all 7
findings), then added the AI layer.

## What was built

1. `campaign-recipient-materialization-pipeline.ts` — closes the
   biggest gap (campaigns never got real recipients).
2. Rewrote `campaign-sender.ts` — real per-recipient personalization,
   real tracking-pixel/link-rewrite/unsubscribe injection, real A/B
   variant split by deterministic hash.
3. `campaign-variant-generation-agent.ts` — real Ollama subject+body
   variant B generation, wired to the real (previously dead)
   `campaign_variants` table.
4. `campaign-behavioral-segmentation-pipeline.ts` — real non-opener →
   nurture-list segmentation.
5. Fixed `logOpenEvent`/`logClickEvent` to actually increment campaign
   counters.
6. Fixed a real unique-constraint gap that made recipient
   materialization's claimed idempotency false.
7. Fixed a real, unrelated pre-existing bug in the campaign detail page
   (wrong response-shape destructuring).
8. New API routes, report-share resolver + page, UI action buttons on
   the campaign detail page.
9. Tests: 12 new Vitest tests, including 2 that directly caught real
   bugs by failing on first run. Live: 21 cases recorded to
   `test_execution`, including a real job-queue send attempt and a real
   Ollama variant-generation call.

## Real bugs found and fixed (6, all via live/integration testing)

See the architecture note for full detail. Two were caught by my own
new unit tests failing (recipient-materialization idempotency; nothing
else touched that code path before). Three were caught only by live,
stateful testing against a running server (behavioral-segmentation
status filter, counter increments, the pre-existing detail-page bug).
One (dead A/B UI) was already known from research and addressed by
building the real AI-driven path instead of patching the wizard.

## Deliberately not built

Purchase attribution (no e-commerce/orders system in TalentsHill to
attribute to); the campaign wizard's manual A/B toggle (superseded by
the AI-generated path, not fixed in place).

## Verification

- `npx tsc --noEmit`: clean throughout (rechecked after every fix).
- `npx vitest run`: 81/81 passed (69 pre-existing at content-factory's
  close + 12 new for this use case).
- Live dev server (port 3015): real contact/list/template/campaign
  creation, real recipient materialization, real AI variant generation,
  real job-queue launch (job runner confirmed active via
  `/api/admin/health`), real per-recipient personalization verified via
  a standalone render script, real tracking-pixel/click-redirect hits
  confirmed updating real DB rows and campaign counters, real send
  failure correctly attributed to the pre-existing SMTP placeholder
  (not a false-positive success).
- `module_registry` updated for `campaigns`.

## Status

Done per the Use-Case Build Standard's definition of done. This is the
clearest example this session of why "live verification, not just unit
tests passing" is mandatory — 4 of the 6 real bugs here were invisible
to any test written in isolation and only surfaced by actually running
the full flow against a live server.
