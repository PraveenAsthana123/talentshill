# End-to-End Test Evidence — Use Case 7/15: AI Brand Perception Dashboard — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3017. Raw output:
`docs/testing/2026-09-14_usecase-07-branding-perception-dashboard-log.txt`.

All temp test data (4 mentions, 4 snapshots, 1 campaign, 1 share token) deleted immediately after
use and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **103/103 passed** (94 pre-existing + 9 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama x3)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/branding/mentions` no cookie | 401 | Unauthorized | PASS |
| 2 | Log a genuinely positive review excerpt | 201 | Created | PASS |
| 3 | Log a genuinely negative social excerpt | 201 | Created | PASS |
| 4 | Sentiment agent on positive mention (real Ollama) | sentiment=positive | Confirmed | PASS |
| 5 | Sentiment agent on negative mention (real Ollama) | sentiment=negative | Confirmed | PASS |
| 6 | `POST /health-snapshot/` with 1 positive + 1 negative | healthScore=50, competitorsTracked=1 (real) | Exact match, math independently verified | PASS |
| 7 | Health narrative agent (real Ollama) | Cites only real score/counts | Correctly cited "50", "one positive and one negative" | PASS |
| 8 | Create campaign, take pre-campaign snapshot | pre=50 | Confirmed | PASS |
| 9 | Log an unscored placeholder mention + 1 more genuinely positive mention | Placeholder excluded from scoring | Confirmed via post-snapshot math | PASS |
| 10 | Analyze the new positive mention, take post-campaign snapshot | post=67 | Exact match: (2-1)/3=0.333→66.67→round 67 | PASS |
| 11 | `GET /campaign-lift/?campaignId=...` | pre=50, post=67, lift=17 | Exact match | PASS |
| 12 | Mint share link, fetch public report, no auth | 200, real snapshot history (4 snapshots) | Confirmed | PASS |
| 13 | Public HTML share page | 200 | HTTP 200 | PASS |
| 14 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**14/14 passed on first attempt — no real bugs found this use case**, a change of pace from several
prior use cases where live verification surfaced pre-existing defects. Both the health-score and
campaign-lift math were independently hand-verified against the live API responses and matched
exactly.
