# Architecture: SMS/WhatsApp Event-Triggered Re-engagement (broadcasts)

**Use case:** #11 of the Use-Case Build Standard build-out — real
condition-evaluated re-engagement messaging for at-risk contacts.

## Research first

A background agent fully mapped the pre-existing `broadcasts` module
before any code was written. It confirmed:

- The `broadcasts` table/pipeline/UI is **email-only** — real SMTP
  sending via `sendWithProfile()`/nodemailer, genuinely non-simulated,
  but no SMS/WhatsApp channel or field exists anywhere.
- **No real SMS/WhatsApp gateway integration exists anywhere in this
  codebase.** An exhaustive repo grep for Twilio/SMS-gateway terms
  returned zero implementation hits. The one "WhatsApp" backend file,
  `lib/integrations/providers/whatsapp.ts`, is a hardcoded stub that
  reports `success: true ... (stub)` on every call regardless of
  input — not a real API call, and unrelated to any real send path.
- **No event-triggered automation exists anywhere.** Everything in
  `broadcasts` and adjacent modules today is manually created and
  manually launched. The closest prior art —
  `contact-activation-pipeline.ts` (writes real `lifecycleStage`) and
  `contact-retention-segmentation-pipeline.ts` (materializes real
  `at_risk` contacts into a static list) — both stop at "produce data
  for a human to act on later." Neither sends anything or evaluates a
  condition to trigger an action automatically.
- `module_registry.api_route_count` for `broadcasts` was stale (2 vs.
  the real 7 pre-existing routes) — corrected as part of this use
  case's registry update.

This confirmed real condition-triggered messaging was genuinely new
work, and that a real SMS/WhatsApp gateway does not exist and must not
be simulated as if it did.

## Scope decision: real condition, real logged messages, never a fabricated delivery

- **The condition is real and disclosed**: `lifecycle_stage === 'at_risk'`
  (read from the real, already-computed field — never recomputed
  here) AND a real phone number is on file AND at least a disclosed
  threshold of days since last real engagement AND not already
  messaged within a disclosed cooldown window (anti-spam). All four
  conditions are pure, unit-tested functions
  (`evaluateReEngagementEligibility`).
- **"Event-triggered" here means the condition is evaluated for real
  each time an admin runs the Pipeline tab**, not a continuously-
  polling background scheduler — consistent with every other pipeline
  in this module and this entire session (no cron/interval scheduler
  exists anywhere in this codebase). This is disclosed explicitly in
  the Governance tab rather than left to imply autonomous background
  automation that doesn't exist.
- **Every message row's status is `'logged'`, never `'delivered'`/
  `'sent'`.** No real SMS/WhatsApp gateway credentials exist in this
  build, so nothing is actually transmitted — the row is an honest
  record of what would be sent to a real contact, for a real reason,
  with real personalized content.

## What was built

- Schema: new `reEngagementMessages` table (contact link, channel,
  real computed trigger reason, real personalized message body, real
  phone snapshot, status, failure reason).
- `lib/pipelines/re-engagement-trigger-pipeline.ts`:
  `computeDaysSince`, `evaluateReEngagementEligibility`,
  `personalizeMessage` (all pure, unit-tested) + the real pipeline
  that evaluates every real at-risk contact and writes a real logged
  message row for each real eligible one.
- `lib/agents/re-engagement-message-agent.ts`: Ollama message-drafting
  agent grounded in real aggregate at-risk stats (count, avg days
  inactive) — never a specific contact's PII, fabrication-guard
  applied.
- API: `re-engagement` list, `trigger` (pipeline), `draft` (agent),
  `share-link` routes; `dashboard`/`report` extended with real
  re-engagement KPIs.
- Customer self-service: `lib/report-share/resolvers/broadcasts.ts`
  (aggregate-only — no message content/phone numbers) +
  `app/report/broadcasts/[token]/page.tsx`.
- Admin UI: ManualTab gained a real-time message log table; PipelineTab
  gained the real trigger form (channel/threshold/cooldown/template);
  AgenticTab gained the message-drafter section; Dashboard/Report/
  Governance tabs extended, including an explicit disclosure of the
  `lib/integrations/providers/whatsapp.ts` stub so it's never mistaken
  for real send capability.

## Deliberately not built

- No real SMS/WhatsApp gateway integration (disclosed, not faked).
- No continuously-polling background scheduler — this codebase has no
  cron/interval job infrastructure for any module; the trigger runs
  on demand, same as every other pipeline built this session.
- No merge with the pre-existing email-only `broadcasts` send path —
  re-engagement messages are a distinct entity/purpose, not routed
  through `broadcast-sender.ts`'s SMTP path.
