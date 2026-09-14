# Use-Case Build Standard (MANDATORY, TalentsHill)

**Effective:** 2026-09-14
**Scope:** Every use case built against the 130-item catalog extracted in
`/mnt/deepa/sohamyoga/docs/chatgpt-extracts/2026-09-13_affiliate-performance-marketing-and-9-vertical-playbooks.md`,
and any future use case built the same way.
**Status:** Live, superseded entries archived below with date + reason when revised.

## Definition of done, per use case

A use case is not "done" until all seven of the following are true. Partial
completion must be disclosed as partial in `module_registry.missing_items`,
never rounded up.

1. **No stub gaps.** Any backend logic, data field, or integration the
   real-time use case needs to actually run must be genuinely implemented.
   If a needed data source doesn't exist yet (e.g. no live ad-platform API),
   build the closest honest real substitute (manually-entered metrics) and
   disclose the limitation — never fabricate the missing data or hardcode a
   plausible-looking number.
2. **Architecture note.** A short design note (data flow, new
   schema/tables, why this shape) committed under `docs/architecture/`.
3. **Task log.** A dated log entry of what was built, decisions made, and
   gaps found, committed under `docs/task-logs/`.
4. **Admin portal UI, existing tabs genuinely updated.** Extend the
   module's existing 10-tab standard (Manual/Pipeline/Agentic/Monitoring/
   Dashboard/Report/Governance/User Story/Testing/Log&Tracking) — Dashboard
   and Report tabs must reflect the new capability's real output, not just
   gain an isolated new page.
5. **Customer self-service view.** TalentsHill has no customer-login
   portal. Self-service means a token-based, read-only, shareable report
   URL (`/report/[token]`, backed by a shared `report_share_tokens` table)
   that a client can open without admin credentials. Built once as shared
   infrastructure, reused per module.
6. **Full test coverage, with real seeded data, using the repo's existing
   pattern — not Playwright.** This repo deliberately uses Vitest unit
   tests (positive/negative/boundary) for deterministic logic, plus a
   custom `test_execution` DB table (`lib/testing/record-test-execution.ts`)
   logging real, live manual HTTP/DB verification against a running `next
   dev` instance (positive, negative, RBAC-denial cases), written up under
   `docs/testing/<date>-<topic>.md` with a raw captured log alongside it
   (see `docs/testing/2026-09-09_e2e-test-evidence.md` +
   `2026-09-09_e2e-test-log.txt` for the reference format). Checked
   2026-09-14 and confirmed Playwright is genuinely absent from this repo
   (no config, no dependency) — that is a deliberate existing choice, not a
   gap, and it is not being introduced. Fixtures must seed real rows, not
   mock the DB layer. Any temp test data created must be deleted and its
   absence verified by a direct DB query afterward, per the existing
   convention.
7. **Live verification.** Actually run the build (dev server + curl/UI),
   not just "tests pass" — confirm the feature produces real output from
   real DB state before calling it done.

## Shared infrastructure (build once, reuse across all 15+ use cases)

- `report_share_tokens` table + `/api/public/report/[token]` +
  `/report/[token]` page — generic customer-self-service mechanism.
- `scripts/run-usecase-tests.sh <module-key>` — CLI test runner (Vitest
  unit tests + live curl-based manual verification for one module),
  writes a timestamped pass/fail log to `docs/testing/`, matching the
  existing `docs/testing/2026-09-09_*` format.

## Revision history

- 2026-09-14: Created. Source: user requirements across the 2026-09-13/14
  ChatGPT-extract follow-up conversation (architecture, task log, UI,
  customer self-service, admin portal, updated dashboards/reports,
  positive/negative/API/e2e tests with seeded data, no stub gaps, mandatory
  end-to-end testing).
- 2026-09-14 (same day, correction): Item 6 originally specified installing
  Playwright. Re-checked the repo at the user's prompt ("check again") and
  confirmed Playwright is genuinely absent — but that is because this repo
  already runs a real, working alternative (Vitest + `test_execution`
  DB-logged manual verification, see `docs/testing/2026-09-09_*`).
  Reverted to using that existing pattern instead of introducing a new,
  unfamiliar test framework.
