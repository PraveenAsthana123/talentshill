# End-to-End Test Evidence — Use Case 8/15: Market Research Opportunity Scoring — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3018. Raw output:
`docs/testing/2026-09-14_usecase-08-market-research-opportunity-scoring-log.txt`.

All temp test data (3 briefs, 1 share token) deleted immediately after use and
confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **113/113 passed** (104 pre-existing + 9 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/market-research` no cookie | 401 | Unauthorized | PASS |
| 2 | Create real brief A (Enterprise RAG adoption) | 201 | Created | PASS |
| 3 | Create real brief B (AI voice agents for SMB) | 201 | Created | PASS |
| 4 | Create real brief C, deliberately no opportunity inputs | 201 | Created | PASS |
| 5 | PATCH real opportunity inputs onto brief A (SOM $2M, competition medium, risk low, fit 80) | 200 | Success | PASS |
| 6 | PATCH real opportunity inputs onto brief B (SOM $150k, competition low, risk medium, fit 60) | 200 | Success | PASS |
| 7 | Run opportunity scoring pipeline | A=82/100 rank 1, B=72/100 rank 2, 1 skipped | Exact match, math independently verified (40+15+15+12=82; 25+30+8+9=72) | PASS |
| 8 | Opportunity recommendation agent (real Ollama) | Cites only real titles/scores, no fabrication | Correctly cited "82/100"/"72/100" and real titles, `fabricationWarning=false` | PASS |
| 9 | `GET /dashboard` opportunity KPIs | opportunityScoredCount=2, avgOpportunityScore=77, topOpportunity=brief A | Exact match, avg independently verified (82+72)/2=77 | PASS |
| 10 | `GET /report` opportunity ranking | 2 entries with real SOM/competition/risk/fit values | Confirmed, values match what was entered | PASS |
| 11 | Mint share link, fetch public report, no auth | 200, real ranking (2 entries) | Confirmed | PASS |
| 12 | Public HTML share page | 200 | HTTP 200 | PASS |
| 13 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**13/13 passed on first attempt — no real bugs found in pre-existing code this
use case.** The existing `PATCH /api/admin/market-research/[id]` route already
forwarded its full request body to `updateMarketResearchBrief`, so the new
opportunity-input fields worked through the existing route with only a type
signature change — no route logic needed to change. The composite score,
ranking, and dashboard-average math were all independently hand-verified
against the live API responses and matched exactly.
