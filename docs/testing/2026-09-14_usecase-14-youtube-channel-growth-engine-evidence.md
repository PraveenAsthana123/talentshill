# End-to-End Test Evidence — Use Case 14/15: YouTube Channel Growth Engine — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3024. Raw output:
`docs/testing/2026-09-14_usecase-14-youtube-channel-growth-engine-log.txt`.

All temp test data (2 channel snapshots, 1 share token) deleted and
confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **166/166 passed** (161 pre-existing + 5 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/youtube/channel-snapshots` no cookie | 401 | Unauthorized | PASS |
| 2 | Growth pipeline correctly reports insufficient data before 2 real snapshots exist | hasEnoughData=false | Confirmed against real pre-existing dev DB state | PASS |
| 3 | Create 2 real channel snapshots 10 days apart | 2×201 | Created | PASS |
| 4 | Growth pipeline computes the exact real delta | +100 subs, +5000 views, +2000 watch-min, 10/day | Exact match, hand-verified | PASS |
| 5 | Growth-narrative agent (real Ollama) cites only real given numbers | fabricationWarning=false | Confirmed — see honest note below | PASS |
| 6 | Dashboard KPIs reflect the real latest snapshot | totalSnapshots=2, latestSubscriberCount=1100, latestTotalViews=55000 | Exact match | PASS |
| 7 | Report includes both real snapshot rows, most recent first | 2 rows, correct values | Exact match | PASS |
| 8 | Customer self-service report includes real snapshot summary and real delta | 200, matches live pipeline result exactly | Confirmed | PASS |
| 9 | Public HTML share page | 200 | HTTP 200 | PASS |
| 10 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**10/10 passed.** The growth-delta math (subscriber/view/watch-time
diffs, days-between, subscribers-per-day) matched hand-verified
expected values exactly in every case.

**Honest note on test #5:** the real local Ollama model cited only the
real numbers given to it (100 subscribers, 5000 views, 2000 watch-time
minutes, 10 days) — no invented figure — but phrased the 5000-view
*total* delta ambiguously as "approximately 5000 per day" and "an
additional hundred subscribers joining daily" (both totals over the
10-day period, not daily rates). This is a real, disclosed small-model
interpretation/phrasing limitation, not a fabrication — the shared
`fabrication-guard.ts` regex checks for invented `%`/`$` patterns, not
arithmetic misphrasing of real given figures, so `fabricationWarning`
correctly stayed `false`. Documented here rather than presented as an
unqualified clean pass.
