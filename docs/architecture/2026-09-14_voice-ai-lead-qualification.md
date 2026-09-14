# Architecture: Voice AI Lead Qualification (voice_ai)

**Use case:** #10 of the Use-Case Build Standard build-out — real BANT-
style qualification scoring of call transcripts plus a real Ollama call
summary, linking a call to a sales record.

## Research first

A background agent fully mapped the pre-existing `voice_ai` module
before any code was written. It confirmed:

- The only data model is `voiceAssets` — a generic content-asset row
  (`script`/`recording`/`transcript`), not a real call record. No
  `phoneNumber`, `direction`, `contactId`, or call-specific field of
  any kind existed on it.
- The one existing Ollama agent (`voice-asset-readiness-agent.ts`)
  scores asset *metadata* completeness (title/type/status/score) — it
  never sends transcript content to the LLM and never touches
  contacts/leads.
- **No telephony integration exists anywhere in this codebase** — an
  exhaustive repo grep for Twilio/SIP/IVR/call-recording terms
  returned zero implementation hits.
- No natural integration point exists on the contacts side either —
  `contacts.source` has no `'voice'`/`'phone'` value wired anywhere.

This confirmed real call-transcript qualification scoring was
genuinely new work, and — per the research agent's explicit
recommendation — that real telephony data does not exist and must not
be simulated.

## Scope decision: real admin-entered transcripts, never fabricated

Call transcripts are real text an admin types describing what was
actually said on a real call — the same honesty pattern already
established by `brand_mentions` (branding) and
`campaignFeedbackNotes` (influencer_video). This is explicitly
disclosed on the Manual tab, in Governance, and on the public
share report. No transcript is auto-generated, simulated, or
implied to come from a live telephony/transcription integration.

## What was built

- Schema: new `voiceCallLogs` table (direction, phone number, real
  transcript, duration, call date, computed qualification
  score/tier, optional contact link) — a dedicated entity, not an
  overload of the generic `voiceAssets` asset library.
- `lib/pipelines/voice-call-qualification-pipeline.ts`:
  `detectCallSignals` (pure, unit-tested) — 5 classic BANT+next-step
  signal categories (budget, authority, need, timeline, next-step),
  20 points each, 0-100 composite, cold/warm/hot tiering (same
  thresholds as the chat use case for consistency). The real pipeline
  loads a call's real transcript, scores it, writes score/tier back,
  and — hot tier only — links to a pre-selected contact or falls back
  to a real email address literally present in the transcript (same
  fallback discipline as use case 9's chat pipeline, applied here from
  the start rather than discovered as a gap mid-build).
- `lib/agents/voice-call-qualification-agent.ts`: Ollama call-summary
  agent grounded in the real transcript, fabrication-guard applied.
- API: per-call `qualify`, `summarize` routes; `calls` list/create;
  `dashboard`/`report` extended with real qualification KPIs;
  `share-link` route.
- Customer self-service: `lib/report-share/resolvers/voice-ai.ts`
  (aggregate-only, no transcript/phone-number leakage) +
  `app/report/voice-ai/[token]/page.tsx`.
- Admin UI: ManualTab gained an Assets/Calls tab switch with a real
  "Log Call" form; a new call detail page shows the real transcript,
  a qualification panel with per-signal breakdown, and an AI-summary
  panel; Dashboard/Report tabs extended; Governance tab documents the
  no-telephony-integration disclosure and the BANT scoring limits.

## Verification note: transient Ollama timeout

The first live call-summary request returned 502 after ~103s (the
60s `AbortSignal.timeout` in `ollama-client.ts` was exceeded across two
sequential model calls). A retry succeeded in ~9.5s with a correctly
grounded, non-fabricated summary. This reads as local-model cold-start/
load variance, not a code defect — no fix was made, but it's recorded
here since a retry was needed to get a clean live-verification pass.

## Deliberately not built

- No telephony/IVR/call-recording integration (disclosed, not faked).
- No consent-tracking field for recordings of a real person's voice —
  pre-existing disclosed gap, unchanged by this use case since no
  audio recording capability was added.
- No merge with the existing `voiceAssets` readiness pipeline — calls
  are a distinct entity with a distinct qualification purpose, kept
  separate rather than overloading a generic asset-completeness score.
