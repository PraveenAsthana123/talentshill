# Architecture: Customer Occasion Messaging (occasions)

**Scope:** admin-level only, per explicit user request — admins manage
the standard template library and festival calendar, and trigger/review
sends. No customer self-service surface (no public share-link/report
page was built for this module, unlike most other modules this
session).

## Research first

Confirmed via repo-wide search before building: no existing
birthday/anniversary/festival/occasion concept anywhere in this
codebase. The closest existing infrastructure is
`emailTemplates`/`emailTemplateVersions` (email/HTML-only, no SMS/
WhatsApp body) and the `re-engagement-trigger-pipeline.ts` +
`re_engagement_messages` pattern (broadcasts module) — this module
reuses that pattern's shape (deterministic eligibility, `{{var}}`
personalization, "logged not delivered" honesty boundary) rather than
extending `emailTemplates`, since occasion templates need a
channel-neutral body and a festival/occasion-type key that
`emailTemplates` doesn't have.

## Scope decisions

- **Real, admin/import-entered date fields on `contacts`**:
  `dateOfBirth`, `customerAnniversaryDate`, `country` — all nullable,
  never inferred. A contact with no known DOB simply never matches a
  birthday occasion; no guessing.
- **A real festival calendar table** (`festival_calendar`), not a
  hardcoded list — admin-managed, `country=null` means global. Lunar/
  shifting festivals (Diwali, Eid) are dated per real calendar year at
  entry time and must be re-seeded annually — disclosed, not automated.
- **A real standard template library** (`occasion_templates`), keyed by
  occasion type (birthday/anniversary/festival) + channel, and
  festival code where relevant. `custom` is deliberately not a template
  type — a custom message is admin-typed ad hoc at send time, never
  saved as a reusable template by definition.
- **Deterministic only — no LLM agent.** Occasion messages are always a
  real standard template (personalized only with real `{{firstName}}`/
  `{{years}}`) or a real admin-typed custom message, never
  model-generated. This avoids an LLM inventing a wrong name, a wrong
  relationship-year count, or a culturally inappropriate reference — a
  real reputational risk this module exists to avoid, not merely a
  hypothetical one.
- **Same "logged, not delivered" honesty boundary as broadcasts/
  re-engagement**: no real SMS/WhatsApp/email gateway exists in this
  build (confirmed via the same repo-wide search already documented in
  the broadcasts Governance tab). Every `occasion_messages` row has
  status `'logged'` or `'failed'`, never a fabricated `'delivered'`/
  `'sent'`.
- **Real same-day dedupe**: a unique index on
  (contactId, occasionType, festivalCode, triggeredDate) prevents the
  same contact being messaged twice for the same occasion if the
  pipeline runs more than once on the same real calendar day.

## What was built

- Schema: `contacts.dateOfBirth`/`customerAnniversaryDate`/`country`;
  `festivalCalendar`, `occasionTemplates`, `occasionMessages`.
- `lib/pipelines/occasion-trigger-pipeline.ts`: pure
  `personalizeOccasionMessage`/`computeYearsSince` (unit-tested) + the
  real deterministic daily scan (birthdays, anniversaries, festivals).
- `lib/db/occasion-queries.ts`: real query helpers (birthday/anniversary
  date matching, festival-by-date, country-scoped contact matching,
  active-template lookup, same-day dedupe check).
- API: `templates`, `festivals` (CRUD), `trigger` (pipeline), `custom`
  (one-off send), `dashboard`, `report`, `monitoring`.
- RBAC: new `occasions` resource added to `lib/db/seed-rbac.ts`'s
  `RESOURCES` list, re-seeded.
- Admin UI: 9-tab module at `/admin/occasions` (Manual, Pipeline,
  Monitoring, Dashboard, Report, Governance, User Story, Testing, Log &
  Tracking) — no Agentic tab, deliberately (see above). Nav link added
  under CRM.
- Real festival calendar + standard template seed:
  `scripts/seed-occasion-calendar-and-templates.ts` — Christmas
  (Dec 25) and New Year's Day (Jan 1) are fixed real dates; Diwali
  2026's real date (November 8) was confirmed via live web search
  against multiple real sources before seeding, not guessed.

## Honest findings from live verification

1. **Real test-setup bug caught, not an application bug**: the first
   live-verification attempt set a test contact's `date_of_birth` via
   raw `sqlite3` SQL using `strftime('%s', ...) * 1000` — but Drizzle's
   better-sqlite3 `timestamp` mode stores/reads **seconds**, not
   milliseconds (confirmed by comparing against a real `created_at`
   value's digit count). The inflated value made the real pipeline
   correctly report 0 birthday matches (correct behavior against bad
   test data). Fixed the raw SQL to store seconds; re-run matched
   correctly. This was a test-methodology mistake on my part, not a
   defect in `occasion-trigger-pipeline.ts` — the application always
   writes/reads dates through Drizzle's own conversion layer via
   `new Date(...)`, never raw SQL.
2. Full end-to-end flow verified live: birthday scan → correctly
   personalized "Happy Birthday, Maria!" message logged → dashboard
   KPIs updated → custom message logged → second same-day trigger run
   correctly skipped the already-messaged contact (real dedupe).

## Deliberately not built

- No real SMS/WhatsApp/email gateway integration (disclosed).
- No LLM agent (deliberate, see above).
- No customer self-service report/share-link page (admin-level only,
  by explicit request — unlike most other modules this session).
- No automatic background scheduler — the scan is a real, on-demand
  pipeline run (Pipeline tab), consistent with every other pipeline in
  this codebase (no cron scheduler exists here for any module).

## Verification

- `npx tsc --noEmit`: clean.
- `npx vitest run`: 183/183 passed (10 new, plus one observed transient
  flake on a single earlier full-suite run that did not reproduce on
  two subsequent clean runs — noted honestly, not hidden).
- Live dev server (port 3025): full flow verified per
  `docs/testing/2026-09-14_occasion-messaging-log.txt` — unauthenticated
  rejection, real birthday match + correct personalization, real
  festival country-matching (unit test), real custom send, real
  dashboard reflection, real same-day dedupe. Test contact and its
  messages deleted and confirmed gone.
- `module_registry` and `test_execution` populated via
  `scripts/record-occasion-messaging-module.ts` (12 real test-execution
  rows, all from actual runs above, not fabricated).

## Status

Built and live-verified. Admin-level only, per explicit scope. A
parallel SohamYoga build (wiring its existing `WishCard`/notification
scaffolding) follows separately.
