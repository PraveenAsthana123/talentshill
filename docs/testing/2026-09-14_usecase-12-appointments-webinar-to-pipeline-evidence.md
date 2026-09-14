# End-to-End Test Evidence — Use Case 12/15: AI Webinar-to-Pipeline Engine — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3022. Raw output:
`docs/testing/2026-09-14_usecase-12-appointments-webinar-to-pipeline-log.txt`.

All temp test data (1 webinar, 3 registrants, 2 created leads, 1 share
token) deleted and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **146/146 passed** (138 pre-existing + 8 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/appointments/webinars` no cookie | 401 | Unauthorized | PASS |
| 2 | Create real webinar + 3 real registrants (hot/no-show/warm) | 4×201 | Created | PASS |
| 3 | Record real attendance/engagement for all 3 | 3×200 | Recorded | PASS |
| 4 | Conversion pipeline scores the real 3-registrant scenario | registrantCount=3, attendedCount=2, qualifiedCount=2, no-show excluded | Exact match | PASS |
| 5 | Warm/hot registrants create real mql/sql leads-pipeline rows | warm→mql, hot→sql, company/email carried over | Exact match | PASS |
| 6 | Post-webinar recap agent (real Ollama) cites only real numbers | fabricationWarning=false | Confirmed, cited exact 3/2/2 figures | PASS |
| 7 | Webinar detail shows exact per-registrant scores/tiers/links | 50/warm/mql-link, 0/cold/no-link, 100/hot/sql-link | Exact match | PASS |
| 8 | Dashboard KPIs reflect real webinar conversion coverage | totalRegistrants=3, attendedCount=2, qualifiedFromWebinars=2, pipelineLinkedCount=2 | Exact match | PASS |
| 9 | Report includes real webinar row with correct counts | registrantCount=3, attendedCount=2, qualifiedCount=2 | Exact match | PASS |
| 10 | Customer self-service report, no auth, aggregate-only | 200, counts only, no registrant PII/notes leakage | Confirmed | PASS |
| 11 | Public HTML share page | 200 | HTTP 200 | PASS |
| 12 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**12/12 passed on first attempt — no real bugs found.** The engagement-
scoring rule, the no-show-always-cold guard, and the qualification-
stage conversion (mql/sql) all matched hand-verified expected values
exactly. A dedicated Vitest regression test additionally confirmed the
pipeline never demotes a manually-promoted lead on re-run.
