# End-to-End Test Evidence — Use Case 11/15: SMS/WhatsApp Event-Triggered Re-engagement — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3021. Raw output:
`docs/testing/2026-09-14_usecase-11-broadcasts-sms-whatsapp-re-engagement-log.txt`.

All temp test data (3 contacts, 1 message, 1 share token) deleted and
confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **138/138 passed** (125 pre-existing + 13 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/broadcasts/re-engagement/trigger` no cookie | 401 | Unauthorized | PASS |
| 2 | Create 3 real contacts: eligible (at_risk+phone), no-phone (at_risk), engaged (not at_risk) | 3×201 | Created | PASS |
| 3 | Real trigger run scores the 3-contact scenario exactly | atRiskCount=2, triggered=1, skipped=1, engaged contact excluded entirely | Exact match | PASS |
| 4 | Logged message has the real personalized body and real phone snapshot | "Hi Priya, we miss you at TalentsHill!", phoneNumberSnapshot=+15550111, status=logged | Exact match | PASS |
| 5 | Immediate re-run correctly cooldown-blocks the already-messaged contact | triggeredCount=0, skippedCount=2 | Exact match | PASS |
| 6 | Message-draft agent (real Ollama) grounds copy in real aggregate stats | fabricationWarning=false, no invented discount | Confirmed | PASS |
| 7 | Dashboard KPIs reflect real re-engagement coverage | atRiskCount=2, reEngagementTotal=1, reEngagementLogged=1 | Exact match | PASS |
| 8 | Report includes real re-engagement message rows | 1 row, sms/logged | Confirmed | PASS |
| 9 | Customer self-service report, no auth, aggregate-only | 200, counts only, no message/phone leakage | Confirmed | PASS |
| 10 | Public HTML share page | 200 | HTTP 200 | PASS |
| 11 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**11/11 passed on first attempt — no real bugs found.** The eligibility
rule (lifecycle_stage/phone/threshold/cooldown), the personalization
substitution, and the cooldown-blocking re-run all matched hand-verified
expected values exactly.
