# End-to-End Test Evidence — Use Case 2/15: AI Lead Scoring & Qualification — 2026-09-14

Full test pass for the leads scoring/qualification use case, run against a live `next dev` instance
on port 3012. Raw command output: `docs/testing/2026-09-14_usecase-02-leads-scoring-qualification-log.txt`.

All temp test data (2 lead submissions with name prefix `__e2e_test_lead`, 1 share token) deleted
immediately after use and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean, 0 errors (rechecked after every fix) |
| `npx vitest run` | **49/49 passed** (30 pre-existing + 19 new across two use cases) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real SMTP failure)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/contact/` hot-tier submission | 201, real score written | leadScore=91, leadTier=hot, qualificationStage=sql | PASS |
| 2 | Real SMTP send attempt (misconfigured `smtp.example.com`) | Fails, alertSentAt stays null | `[EMAIL ERROR] getaddrinfo ENOTFOUND smtp.example.com`; alertSentAt=null confirmed | PASS (after fix; first observation was the bug itself) |
| 3 | `GET /api/admin/leads/:id` no cookie | 401 | `{"error":"Unauthorized"}` | PASS |
| 4 | `POST /api/admin/leads/:id/send-alert` on already-non-eligible lead | 200, sent=false | `{"sent":false,"reason":"Not eligible..."}` | PASS |
| 5 | `PATCH /api/admin/leads/:id/qualification` promote + assign | 200 | stage=opportunity, assignedTo=jane@talentshill.com | PASS |
| 6 | `PATCH .../qualification` invalid stage | 400 | Rejected with valid-values message | PASS |
| 7 | `POST /api/admin/leads/pipeline` re-score, **before** fix | Should hold manual stage (found: did NOT) | Reverted opportunity -> sql — real bug found | FOUND BUG, FIXED |
| 8 | Re-promote + re-run pipeline **after** fix | Holds at opportunity | Confirmed: stayed opportunity | PASS |
| 9 | `POST /api/admin/leads/share-link` | Real token minted | Token + `/report/leads/<token>` returned | PASS |
| 10 | `GET /api/public/report/<token>` no cookie | 200, aggregate only | Correct summary; grep for name/email found nothing | PASS |
| 11 | `GET /report/leads/<token>` | 200 | HTTP 200 | PASS |
| 12 | Cleanup: delete 2 test leads + share token | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**10/12 passed on first attempt; 2 real bugs found and fixed during this pass** (test #2's
underlying alertSentAt-on-failure bug, and test #7's stage-regression bug) — both are exactly the
class of defect that only live, stateful, multi-step verification catches, not isolated unit tests
run against mocked state alone. Both are now covered by regression tests in
`tests/unit/lead-scoring-and-qualification.test.ts`.
