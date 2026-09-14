# End-to-End Test Evidence — Use Case 13/15: Video Repurposing Factory — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3023. Raw output:
`docs/testing/2026-09-14_usecase-13-video-editing-repurposing-factory-log.txt`.

All temp test data (1 project, 3 clip plans, 1 share token) deleted
and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **161/161 passed** (146 pre-existing + 15 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/video-editing/[id]/clips` no cookie | 401 | Unauthorized | PASS |
| 2 | Create real 120s source video + 3 real clip plans (2 valid, 1 out-of-range) | 4×201 | Created | PASS |
| 3 | Readiness scores exactly for all 3 clips | 100/50/100 | Exact match, hand-verified | PASS |
| 4 | Coverage pipeline aggregates the real 3-clip scenario | clipCount=3, totalClipSeconds=60, coverageRatio=0.5, invalidRangeCount=1 | Exact match | PASS |
| 5 | Clip-idea agent (real Ollama) discloses it has not watched the footage | fabricationWarning=false, explicit human-verify disclaimer | Confirmed | PASS |
| 6 | Dashboard KPIs reflect real repurposing coverage | totalClipPlans=3, avgClipReadinessScore=83 | Exact match | PASS |
| 7 | Report includes real per-clip rows | correct source/platform/readiness per clip | Exact match | PASS |
| 8 | Customer self-service report, no auth, aggregate-only | 200, counts only | Confirmed | PASS |
| 9 | Public HTML share page | 200 | HTTP 200 | PASS |
| 10 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**10/10 passed on first attempt — no real bugs found.** The range-
validation rule, the readiness checklist scoring, and the coverage
aggregation all matched hand-verified expected values exactly.
