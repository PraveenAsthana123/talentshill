# Task Log: Use Case 2/15 — AI Lead Scoring & Qualification

**Date:** 2026-09-14
**Module:** leads
**Source:** Use Case Build Standard, item 2

## What was built

1. Researched existing state first (Explore agent) — leads was already
   `real` status with a working scoring pipeline + Ollama agent, so this
   was an extension, not a rebuild.
2. Consolidated two disagreeing scoring rubrics into one
   (`lib/contact/lead-scoring.ts` as single source of truth).
3. Added `qualificationStage`/`assignedTo`/`alertSentAt` columns +
   `classifyQualificationStage`/`resolveQualificationStageOnRescore`
   (`lib/contact/lead-qualification-stage.ts`).
4. Added tier-aware hot-lead alert (`lib/contact/lead-alert.ts`),
   wired into both the submission route and the pipeline re-score path.
5. New admin routes: `[id]/qualification` (PATCH), `[id]/send-alert`
   (POST), `share-link` (POST).
6. Leads-specific customer self-service: aggregate-only resolver + a
   dedicated share page (the shared ads-management page couldn't be
   reused — different report shape).
7. UI: lead detail page (qualification stage select, assignment field,
   alert status + manual send button), Dashboard (qualification-pipeline
   + alerting KPI tiles), Report tab (share-link button).
8. Tests: 17 new Vitest tests (pure-function + 2 mocked failure/success
   cases for the alert function). Live verification: 19 manual/pipeline
   cases recorded to `test_execution`.

## Real bugs found and fixed (3, all via live/careful testing, not just unit tests)

1. Two disagreeing lead-scoring rubrics silently producing different
   scores depending on which UI path re-scored a lead.
2. `sendHotLeadAlertIfNeeded` would have marked a lead as alerted even
   when the real SMTP send failed (`sendEmail` swallows its own errors).
   Caught only by live-testing against genuinely-misconfigured SMTP
   creds already present in `.env.local` (`smtp.example.com` placeholder,
   `getaddrinfo ENOTFOUND`).
3. A pipeline re-run silently reverted a manually-promoted qualification
   stage back to the tier's auto-classified default. Caught only by
   manually promoting a lead, re-running the pipeline, and checking the
   result — not something a pure unit test in isolation would have
   surfaced, since it depends on the interaction between manual and
   automatic writers to the same column.

## Deliberately not built

Company/person enrichment — no real third-party data source exists in
this environment; disclosed as a gap rather than faked.

## Verification

- `npx tsc --noEmit`: clean throughout (re-checked after each fix).
- `npx vitest run`: 49/49 passed (44 pre-existing + 5 new from item 1,
  now 17 more for this use case).
- Live dev server (port 3012): full flow tested end-to-end including two
  full bug-reproduction-then-fix-then-reverify cycles.
- `module_registry.missing_items` updated for `leads`.

## Status

Done per the Use-Case Build Standard's definition of done. This use case
took materially longer than budgeted because live verification surfaced
two bugs unit tests alone would have missed — validates why the Standard
requires both, not just automated coverage.
