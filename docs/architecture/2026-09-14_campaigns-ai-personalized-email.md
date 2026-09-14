# Architecture: AI Personalized Email Campaigns (campaigns)

**Use case:** #13 of the 130-item catalog — "AI personalized newsletter
campaign: segment → generate subject/body variants → send → open/click
tracking → behavioral segmentation → resend/nurture → purchase."

## This use case required fixing 6 real, pre-existing bugs before adding AI

Research before building found the email system was far more built-out
than expected (7 admin modules sharing one substrate), but three pieces
of the use case's own flow had real schema and real helper code that was
**never wired into the actual send path**. Building AI features on top
of a broken send pipeline would have been dishonest — so this use case
fixed the underlying gaps first, then added the AI layer.

1. **Campaign recipients were never materialized.** `addCampaignRecipients()`
   had zero callers anywhere in the codebase. A launched campaign always
   found 0 pending recipients and "completed" instantly with nothing
   sent, no error. Fixed with `campaign-recipient-materialization-pipeline.ts`
   (same pattern as the pre-existing `list-sync-pipeline.ts`, which
   fixed the identical class of gap for dynamic lists vs. broadcasts).

2. **Open/click tracking was fully implemented but never invoked.**
   `injectTrackingPixel`/`rewriteLinks`/`injectUnsubscribeLink` and the
   receiving routes (`/api/t/o`, `/api/t/c`, `/api/t/u`) were real and
   unit-tested in isolation, but `campaign-sender.ts` never called them.
   Fixed by wiring all three into the send loop.

3. **A/B testing was a UI stub over a dead table.** The wizard's
   checkbox never reached the create API; `campaign_variants` had zero
   real rows. Fixed by building `campaign-variant-generation-agent.ts`,
   which is now the real, working path to a populated `campaign_variants`
   table (rather than trying to also fix the unrelated wizard checkbox,
   which remains a separate known gap, disclosed not silently left as if
   fixed).

4. **`addCampaignRecipients`'s `onConflictDoNothing()` was dead code**
   — no unique constraint existed on `(campaignId, contactId)`, and a
   fresh random `id` every call meant nothing could ever conflict.
   Caught by my own new pipeline's idempotency test actually failing on
   first run. Fixed with a real unique index; this was a genuine
   duplicate-send risk once recipient materialization became real.

5. **Behavioral segmentation's own first draft under-counted the sent
   cohort** — filtering only `status IN (sent, delivered)` silently
   excluded recipients who had already progressed to
   `opened`/`clicked`. Caught live against a real campaign with a real
   tracked click. Fixed to include all four post-send statuses.

6. **`logOpenEvent`/`logClickEvent` never incremented
   `campaign.totalOpened`/`totalClicked`.** Per-recipient tracking
   worked correctly, but the campaign-level rollup used by the
   Dashboard/Report/share-link views always showed 0. Fixed to
   increment on first-open/first-click only (not every repeat pixel
   load), verified live.

7. **The campaign detail page had a silent, unrelated pre-existing bug**:
   `setCampaign(wholeApiResponse)` instead of `setCampaign(response.campaign)`
   — every stat on the page (`totalSent`, `totalOpened`, etc.) was
   reading from the wrong object shape and had been `undefined` this
   whole time. `variants` was also never fetched at all. Found by
   reading the real route's response shape rather than trusting the
   existing component code, and fixed alongside adding the new action
   buttons.

## What was actually added (the AI part)

- `campaign-variant-generation-agent.ts`: real Ollama-generated subject
  + body variant B, grounded in the real campaign/template, using the
  merge-variable convention (`{{firstName}}`), with the same
  fabrication-detection backstop (`lib/agents/fabrication-guard.ts`,
  now shared with content-factory) since this is open-ended generation,
  not narration.
- Per-recipient personalization: `campaign-sender.ts` now renders each
  recipient's real `{{firstName}}`/`{{lastName}}`/`{{company}}`/`{{email}}`
  via the pre-existing `renderTemplate()` instead of sending the raw,
  unrendered template to everyone.
- `campaign-behavioral-segmentation-pipeline.ts`: real non-opener
  identification from real `campaignRecipients` state, materialized
  into a real static list ready for a nurture resend — reusing existing
  list infrastructure rather than inventing a new segment mechanism.
- Customer self-service: new resolver + dedicated page (per-campaign,
  via `entityId`, unlike the module-wide resolvers built for prior use
  cases) — aggregate send/open/click + variant performance only.

## Deliberately not built

- **Purchase attribution** (the use case's final flow step). TalentsHill
  has no e-commerce/orders system to attribute a purchase to an email
  click — disclosed as out of scope, not faked.
- **The campaign wizard's manual A/B checkbox** remains disconnected
  from the backend. The AI-generated path (item 3 above) is the real,
  working way to create a variant B today; fixing the manual wizard path
  too was out of scope for this use case.
