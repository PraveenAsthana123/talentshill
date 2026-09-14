# End-to-End Test Evidence — Use Case 10/15: Voice AI Lead Qualification — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3020. Raw output:
`docs/testing/2026-09-14_usecase-10-voice-ai-lead-qualification-log.txt`.

All temp test data (2 call logs, 1 contact, 1 share token) deleted and
confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **125/125 passed** (119 pre-existing + 6 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/voice-ai/calls` no cookie | 401 | Unauthorized | PASS |
| 2 | Log a real cold call transcript | 201 | Created | PASS |
| 3 | Log a real hot call transcript (budget/need/timeline/next-step + real email) | 201 | Created | PASS |
| 4 | Qualification pipeline scores the cold call | score=0, tier=cold | Exact match | PASS |
| 5 | Qualification pipeline scores the hot call | score=80, tier=hot (4 signals; no authority phrase) | Exact match, hand-verified 4×20=80 | PASS |
| 6 | Hot call auto-creates a real contact from the real typed email | contactCreated=true, source=voice_call | Confirmed | PASS |
| 7 | Call-summary agent (real Ollama) grounds its recap in the real transcript | fabricationWarning=false | Confirmed — first attempt hit a transient 60s+ Ollama timeout (502), retry succeeded cleanly in ~9.5s | PASS |
| 8 | Call detail endpoint reflects the written qualification + contact link | Correct values | Confirmed | PASS |
| 9 | Dashboard KPIs reflect real call qualification coverage | totalCalls=2, qualifiedCalls=2, hotCalls=1, contactsLinkedFromCalls=1 | Exact match | PASS |
| 10 | Report includes per-call qualification tier/score/contact-linked | Correct for both calls | Confirmed | PASS |
| 11 | Customer self-service report, no auth, aggregate-only | 200, counts only, no transcript/phone leakage | Confirmed | PASS |
| 12 | Public HTML share page | 200 | HTTP 200 | PASS |
| 13 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**13/13 passed.** One transient infrastructure issue (a 502 from a real Ollama
call exceeding its 60s timeout on the first attempt) was hit, diagnosed as
local-model load rather than a code defect, and resolved by retrying — the
retry produced a correctly grounded, zero-fabrication summary. No code changes
were needed to fix it.
