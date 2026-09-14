# Architecture: Lifecycle/Activation Journey Tracking (contacts)

**Use case:** #14 of the 130-item catalog — "Lifecycle Marketing:
trial-to-paid-to-renewal journey — signup → onboarding → activation
score → personalized messages → conversion → usage monitoring → churn
risk → retention offer → renewal."

## Scope decision: `contacts`, not `campaigns`, and not a duplicate of `leads`

Originally cross-checked to the `campaigns` module, but TalentsHill has
no "trial/subscription" product with its own paying end-customers to
track through a literal trial→paid funnel — it's an agency's own admin
tool. Research before building found the real, honest target: the
`contacts` CRM table already has a `leadScore`, but that score
(`contact-completeness-pipeline.ts`) is a **static profile-completeness
rubric** — never behavioral. The `leads` module's MQL/SQL funnel (use
case 2) operates on a **different table** (`contactSubmissions`, form
submissions) and is unrelated at the schema level. Real, joinable,
per-contact behavioral data already exists (`campaignRecipients`/
`emailEvents`, both carry `contactId` directly) but nothing aggregated
it per-contact — `getEventsByContact()` existed and was dead code. This
was genuinely unclaimed territory, not a duplicate of prior work.

**Naming discipline**: the pre-existing `contact-engagement-agent.ts`
already uses "engagement" vocabulary for its advisory completeness
recommendation. The new agent is named `contact-retention-agent.ts`
(role `contact_retention_advisor`, distinct from the existing
`contact_engagement_advisor`) specifically to avoid reading as a
duplicate of already-built work.

## What was built

- `contacts.lifecycleStage` (new/engaged/at_risk/churned) +
  `activationScore` (0-100) + `lastEngagedAt` — real new columns.
- `contact-activation-pipeline.ts`: `classifyLifecycleStage` (pure,
  unit-tested, `now` always passed in rather than read internally) +
  `computeActivationScore` (pure, weighted 70% engagement rate / 30%
  recency decay) + the deterministic pipeline that aggregates real
  `campaignRecipients` history per contact and writes all three fields.
- `contact-retention-segmentation-pipeline.ts`: real at-risk contacts →
  a real static list, reusing the exact same list-materialization
  pattern as `campaign-behavioral-segmentation-pipeline.ts` (use case 5)
  rather than inventing a new mechanism.
- `contact-retention-agent.ts`: Ollama narrative over the real lifecycle
  distribution.
- Customer self-service: aggregate-only resolver (stage counts, no PII)
  — contacts' own Governance tab already flags this module as
  higher-PII-risk than leads, so this follows the same discipline as the
  leads resolver, not the ads_management/campaigns per-entity detail
  pattern.

## Real bug found and fixed

`POST /api/admin/contacts` never destructured `status` from the request
body, so creating a contact with `status: 'unsubscribed'` (e.g. from an
import source that already knows a contact opted out) silently landed
as the default `'active'`. Same bug class as use case 3's
`audienceFitScore` gap — an API-boundary field silently dropped despite
the query layer already supporting it. Caught live: a contact created
with `status: 'unsubscribed'` scored as `'new'` instead of `'churned'`
in the activation pipeline. Fixed by adding `status` to the destructure
and the `createContact` call; re-verified live.

## Why the retention agent's narrative "disagreed" with a manual edit (not a bug)

During live testing, a contact's `lifecycleStage` was manually set to
`at_risk` via direct SQL to test segmentation, then the retention
agent's narrative reported 0 at-risk contacts. This is correct, not a
bug: the agent's "search" step always re-runs the real activation
pipeline against real current signals before narrating, so a manually
forced flag that doesn't match the real underlying engagement data gets
overwritten by ground truth on every run. Segmentation was tested
separately, directly against the pipeline output, to isolate this from
the recompute behavior.

## Deliberately not built

- Full "trial → paid → renewal" product lifecycle — TalentsHill has no
  subscription/billing system of its own to track.
- Per-contact content-engagement join (`content_engagement_metrics` has
  no `contactId` column — would require a new visitor-identity layer,
  out of scope, confirmed via research not to exist).
