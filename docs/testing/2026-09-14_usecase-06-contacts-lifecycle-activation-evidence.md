# End-to-End Test Evidence — Use Case 6/15: Lifecycle/Activation Journey Tracking — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3016. Raw output:
`docs/testing/2026-09-14_usecase-06-contacts-lifecycle-activation-log.txt`.

All temp test data (4 contacts, 1 campaign, 2 lists, events, 1 share token) deleted immediately
after use and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **94/94 passed** (81 pre-existing + 13 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real tracking flow, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/contacts/activation-scoring` no cookie | 401 | Unauthorized | PASS |
| 2 | Create 3 contacts (new/engaged/unsubscribed profiles) | 201 each | Created | PASS |
| 3 | Create unsubscribed contact via API | status persisted as 'unsubscribed' | **FOUND BUG: status stayed 'active'** (route never forwarded the field) | FOUND BUG, FIXED |
| 4 | Re-create after fix | status='unsubscribed' | Confirmed via GET | PASS |
| 5 | Real list + campaign + materialize-recipients for the "engaged" contact | 1 recipient added | Confirmed (reusing use case 5 infra) | PASS |
| 6 | Real pixel hit + real click redirect for that recipient | opened_at/clicked_at set | Confirmed via the real `/api/t/o` and `/api/t/c` routes | PASS |
| 7 | `POST /activation-scoring/` across all real contacts | new/new/engaged/churned correctly classified | Exactly as expected: new contact→new(0), engaged contact→engaged(100), unsubscribed contact→churned(0) | PASS |
| 8 | Manually flag a contact at_risk, run retention segmentation | 1 at-risk, real list created | Confirmed | PASS |
| 9 | Run retention narrative agent (real Ollama) | Reflects real, freshly-recomputed state | Correctly reported 0 at-risk (the manual flag was overwritten by real recompute inside the agent's search step) — confirmed as correct behavior, not a bug | PASS |
| 10 | Mint contacts share link, fetch public report, no auth | 200, aggregate stage counts, no PII | Confirmed; grepped response for email strings, found none | PASS |
| 11 | Public HTML share page | 200 | HTTP 200 | PASS |
| 12 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**10/12 passed on first attempt; 1 real bug found and fixed live** (contact status field silently
dropped on create) — plus one apparent discrepancy investigated and confirmed to be correct
behavior (agent recomputes ground truth rather than trusting a stale manual flag), not a bug.
