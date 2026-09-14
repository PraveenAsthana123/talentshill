# End-to-End Test Evidence — Use Case 1/15: AI Ad Budget Optimization — 2026-09-14

Full test pass for the ads_management budget-optimization use case, run against a live `next dev`
instance on port 3011. Raw command output: `docs/testing/2026-09-14_usecase-01-ads-budget-optimization-log.txt`.

All temp test data (1 ad campaign `__e2e_test_campaign`, 1 metric entry, 1 share token) created for
these tests was deleted/revoked immediately after use and confirmed gone via direct DB/API query —
nothing here is left in the live database as test residue.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean, 0 errors |
| `npx vitest run` (6 files, 32 tests) | **32/32 passed**, incl. 9 new (`tests/unit/ad-budget-optimization.test.ts`) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `GET /api/admin/ads-management` with no session cookie | 401 | `{"error":"Unauthorized"}` | PASS |
| 2 | `POST /api/auth/login` as admin | 200, session cookie | HTTP 200, user object | PASS |
| 3 | `POST /api/admin/ads-management` create real campaign | 200/201 + id | Campaign `03f7b8cf-...` created | PASS |
| 4 | `POST /api/admin/ads-management/metrics/` log real metrics | 201 | `{"id":"6f7ac452-..."}` | PASS |
| 5 | `POST /api/admin/ads-management/budget-optimization/` | Real ROAS-ranked suggestion | ROAS 4.50 computed from 900/200, correct | PASS |
| 6 | `POST /api/admin/ads-management/budget-optimization/agentic/` | Real Ollama narrative, grounded | 370 tokens, narrative referenced only the real campaign name/ROAS given | PASS |
| 7 | `POST /api/admin/ads-management/share-link/` | Real opaque token minted | Token + `/report/<token>` URL returned | PASS |
| 8 | `GET /api/public/report/<token>` with NO admin cookie | 200, real report | Correct JSON, unauthenticated | PASS |
| 9 | `GET /api/public/report/not-a-real-token` (negative) | 404 | `{"error":"Report not found"}` | PASS |
| 10 | `GET /report/<token>` (public HTML page) | 200 | HTTP 200 | PASS |
| 11 | `DELETE /api/admin/ads-management/<id>` | 200, cascade-deletes metrics | `{"success":true}` | PASS |
| 12 | `GET /api/admin/ads-management/<id>` after delete | 404 | `{"error":"Not found"}` | PASS |
| 13 | Public report re-fetched after campaign delete (share token still valid) | Reflects 0 scored campaigns, no stale/invented data | `scoredCampaigns:0, suggestions:[]` | PASS |
| 14 | Revoke share token, re-fetch | 410 | `{"error":"This link has been revoked."}` | PASS |

**14/14 manual test cases passed. One real bug found and fixed during this pass** (not a test
failure caught after the fact — found while manually verifying the n=1 live agentic response):
`classifyBudgetAction`'s top-half math returned "hold" for every single-scored-campaign case
regardless of ROAS. Fixed, covered by a new regression test, and reverified live (ROAS 4.50 →
correctly "increase 15%" after the fix).
