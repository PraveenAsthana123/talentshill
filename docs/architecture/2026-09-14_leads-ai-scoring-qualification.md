# Architecture: AI Lead Scoring & Qualification (leads)

**Use case:** #2 of the 130-item catalog — "AI Lead Capture and Qualification"
(ad/content → landing page → smart form → enrich → AI score → MQL → CRM →
salesperson alert → meeting → opportunity).

## What already existed (found via research before building, not rebuilt)

`leads` was already `module_registry.built_status = 'real'`: smart-form
capture (`app/api/contact/route.ts`), a deterministic scoring pipeline, an
Ollama qualification-narrative agent, and full 10-tab CRUD. This use case
extends it rather than starting over.

## Real bug found and fixed: two disagreeing scoring rubrics

`lib/contact/lead-scoring.ts` (submission-time) and
`lib/pipelines/lead-scoring-pipeline.ts` (Pipeline-tab re-run) computed
lead score from **different weight tables and a different cool-tier
threshold** (25 vs 20), both writing to the same
`contact_submissions.leadScore`/`leadTier` columns. Re-running the
Pipeline tab silently changed a lead's score using different math than
what the public form produced. Fixed by making `calculateLeadScore` in
`lead-scoring.ts` the single source of truth (now returns a per-stage
breakdown too) and having the pipeline call it instead of duplicating
the rubric.

## New capability: MQL/SQL qualification staging

`contact_submissions.qualificationStage` (enum: unqualified/mql/sql/
opportunity/customer). `classifyQualificationStage(tier)` gives a
deterministic starting stage (hot→sql, warm→mql, else unqualified) — a
default, not a locked verdict. `PATCH /api/admin/leads/:id/qualification`
lets an admin manually promote/demote a lead and assign it to a
salesperson (`assignedTo`, free-text — no salesperson-role user directory
exists to validate against, disclosed rather than faked).

**Second real bug found and fixed, caught only through live testing**: a
pipeline re-run after a manual promotion silently reverted the stage back
to the tier's auto-classified default, undoing the human's decision. Fixed
with `resolveQualificationStageOnRescore`, which only lets an automatic
re-score advance or hold a stage, never regress it.

## New capability: tier-aware salesperson alert

`sendHotLeadAlertIfNeeded` — distinct from the existing generic
admin-notification email that fires on every submission. Only hot-tier
leads get it, and it's idempotent via `alertSentAt`. **Third real bug,
caught only through live testing against actually-misconfigured SMTP**:
`sendEmail()` catches its own errors and returns `{success:false}` rather
than throwing; the original code called `markAlertSent` unconditionally
after `await sendEmail(...)`, which would have marked a lead as alerted
even when the send genuinely failed. Fixed to check `result.success`
first. Manual override: `POST /api/admin/leads/:id/send-alert`.

## Deliberately not built: enrichment

Company/person enrichment (Clearbit/ZoomInfo-style lookups) requires a
third-party data source that doesn't exist in this environment. Per this
codebase's established pattern (e.g. ads_management's disclosed lack of
ad-platform API sync), this is disclosed as a genuine gap in
`module_registry.missing_items`, not faked with a placeholder API client
or invented enrichment data.

## Customer self-service: aggregate-only, not raw PII

Leads' own Governance tab already flags PII handling as load-bearing.
The share-link resolver (`lib/report-share/resolvers/leads.ts`) returns
only counts (total/hot/warm, by industry, by qualification stage) —
never individual names, emails, or phone numbers. Confirmed live: grepped
the public JSON response for the test lead's name/email and found
neither. Required its own page (`app/report/leads/[token]/page.tsx`)
since the ads-management share page hardcodes that module's report
shape — the token/registry plumbing is generic, but rendering isn't.
