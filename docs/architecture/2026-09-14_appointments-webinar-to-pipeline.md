# Architecture: AI Webinar-to-Pipeline Engine (appointments)

**Use case:** #12 of the Use-Case Build Standard build-out — real
webinar attendance/engagement tracking that converts qualifying
attendees into the pre-existing leads pipeline.

## Research first

A background agent fully mapped the pre-existing `appointments` module
before any code was written. It confirmed:

- The entire module models **one person booking one 1:1 consultation
  slot** (`lib/appointments-db.ts`, a flat JSON file, not this DB) —
  no group/event entity, no attendee list, no attendance/no-show
  concept existed anywhere.
- `appointment-followup-pipeline.ts`/`-agent.ts` only re-prioritize an
  existing booking's follow-up urgency — never touches
  `contacts`/`contactSubmissions`, never records attendance.
- **No real webinar-platform integration exists anywhere in this
  codebase.** An exhaustive repo grep for Zoom/Calendly/webinar/
  registrant/attendee-as-a-domain-concept returned zero hits.
- The real, pre-existing sales-pipeline-stage machinery is the
  `leads` module's `contactSubmissions` table (`qualificationStage`
  enum: unqualified/mql/sql/opportunity/customer) and
  `lib/contact/lead-qualification-stage.ts`'s
  `resolveQualificationStageOnRescore` (already fixed once this
  session to never demote a manually-promoted lead on re-score) — the
  correct, real integration target, not something to reinvent.
- `module_registry.api_route_count` for `appointments` was stale (7
  vs. the real 8 pre-existing routes) — same issue class already found
  and fixed in `broadcasts`, corrected here too.

This confirmed a real group-event entity with real attendance and a
real leads-pipeline conversion were both genuinely new work.

## Scope decisions

- **A real new entity, not an overload of the 1:1 `Appointment`
  model**: `webinars` + `webinarRegistrants`, since a webinar
  fundamentally has a roster, not a single contact.
- **Attendance and engagement are real, admin-entered observations,
  never simulated.** No Zoom/webinar-platform integration exists, so
  this is disclosed explicitly (Manual tab copy, Governance) rather
  than implied as platform-verified data.
- **Scoring is a fixed, disclosed keyword rule, never an LLM guess.**
  A no-show always scores 0 regardless of any notes entered (notes
  only mean something if the person actually attended). An attendee
  starts at 50 and gains up to 50 more from 3 real keyword-detected
  engagement signals (asked a question / requested a follow-up /
  stayed engaged), same 4-tier convention (`hot`/`warm`/`cool`/`cold`)
  already used by `lib/booking-utils.ts::getLeadTier`.
- **Pipeline conversion reuses the real, pre-existing leads
  machinery** — `createSubmission`/`updateSubmissionQualification`
  plus `classifyQualificationStage`/`resolveQualificationStageOnRescore`
  — rather than building a parallel qualification concept. Only
  warm/hot registrants are pushed into the pipeline; cold/no-show
  registrants never are.
- **Fields the leads schema requires but webinar registration doesn't
  naturally collect** (industry, projectStage, timeline) are set to
  the honest literal string `'unknown'` — a disclosed placeholder,
  never a fabricated value — and `message` is a real, literal
  description of what actually happened (webinar title/topic,
  attendance, real engagement notes if any).

## What was built

- Schema: `webinars`, `webinarRegistrants` (real registrant roster,
  real attendance/engagement, computed qualification score/tier, real
  link into `contactSubmissions`).
- `lib/pipelines/webinar-pipeline-conversion-pipeline.ts`:
  `computeAttendeeQualificationScore` (pure, unit-tested) + the real
  pipeline that scores every registrant and converts qualifying ones.
- `lib/agents/webinar-followup-agent.ts`: Ollama post-webinar recap
  grounded in the real pipeline output, fabrication-guard applied.
- API: webinar CRUD, registrant creation, attendance recording,
  `convert` (pipeline), `recap` (agent), `share-link`;
  `dashboard`/`report` extended with real webinar KPIs.
- Customer self-service: `lib/report-share/resolvers/appointments.ts`
  (this module previously had none — a real gap closed alongside this
  use case) + `app/report/appointments/[token]/page.tsx`, aggregate-only.
- Admin UI: ManualTab gained a Webinars section + create form; a new
  webinar detail page for adding registrants, recording attendance/
  engagement, and running conversion/recap; Dashboard/Report/
  Governance tabs extended.

## Deliberately not built

- No real webinar-platform (Zoom/Calendly) integration (disclosed,
  not faked).
- No migration of the 1:1 `Appointment` model off its flat JSON file
  onto this DB — a real, disclosed pre-existing architectural
  inconsistency, out of this use case's scope to fix.
- No automatic attendance detection — an admin records the real
  outcome after the fact, same disclosure discipline as every other
  "no real third-party platform" module this session.
