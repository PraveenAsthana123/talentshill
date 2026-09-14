# End-to-End Test Evidence — Use Case 3/15: Influencer Creator Discovery & ROI Scoring — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3013. Raw output:
`docs/testing/2026-09-14_usecase-03-influencer-roi-scoring-log.txt`.

All temp test data (3 creators prefixed `__e2e_test_creator_`, their metrics, 1 share token)
deleted immediately after use and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **60/60 passed** (49 pre-existing + 11 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama x2)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `GET /api/admin/influencer-video` no cookie | 401 | Unauthorized | PASS |
| 2 | Create winning creator (fee $500, audienceFitScore 92) | 201, fields persisted | **FOUND BUG**: audienceFitScore returned null | FOUND BUG, FIXED |
| 3 | Re-create with fix applied | audienceFitScore=85 persisted | Confirmed via GET | PASS |
| 4 | Log winning metrics (revenue $2000) + losing metrics (revenue $200, both fee $500) | 201 each | Both created | PASS |
| 5 | `POST /roi-scoring/` | win ROI=3.0 renew, lose ROI=-0.6 drop | Exact match, math independently verified | PASS |
| 6 | Creator search platform=youtube minFit=80 | Finds the fit=85 creator | `["__e2e_test_creator_fit"]` | PASS |
| 7 | Creator search minFit=95 | Excludes fit=85 creator | `[]` | PASS |
| 8 | Sentiment agent, no feedback notes | insufficient_data | Confirmed | PASS |
| 9 | Log real positive feedback text, re-run sentiment | positive, grounded explanation | 318 tokens, correctly classified, explanation only references given text | PASS |
| 10 | `POST /roi-scoring/agentic/` (real Ollama) | Narrative cites only real creators/numbers | Correctly cited "E2E Test Creator Win" 300% ROI and "E2E Test Creator Lose" -60% ROI, exact dollar figures | PASS |
| 11 | Mint share link, fetch public report, no cookie | 200, real suggestions | scoredCreators=2, suggestions=2 | PASS |
| 12 | Public HTML share page | 200 | HTTP 200 | PASS |
| 13 | Cleanup: delete 3 creators + metrics + token | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**12/13 passed on first attempt; 1 real bug found and fixed** (audienceFitScore/
campaignFeedbackNotes silently dropped by the create route despite being accepted by the query
layer and sent by the frontend) — an API-boundary wiring gap, not a logic bug, illustrating why
live verification catches defect classes unit tests structurally can't.
