# End-to-End Test Evidence — Use Case 5/15: AI Personalized Email Campaigns — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3015. Raw output:
`docs/testing/2026-09-14_usecase-05-campaigns-personalized-email-log.txt`.

All temp test data (2 contacts, 1 list, 1 template, 1 campaign + its recipients/variants/tokens,
1 share token) deleted immediately after use and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean (rechecked after every one of the 6 fixes below) |
| `npx vitest run` | **81/81 passed** (69 pre-existing + 12 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real job queue, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Create 2 contacts, 1 static list, add members | 200/201 each | Confirmed | PASS |
| 2 | Create a template with `{{firstName}}`/`{{lastName}}`/`{{company}}` | 201 | Created | PASS |
| 3 | Create campaign (audienceType=list) | 201 | Created | PASS |
| 4 | `POST .../materialize-recipients/` | 2 added, audienceCount=2 | Confirmed exactly | PASS |
| 5 | `POST .../generate-variant/` (real Ollama) | Variant B created, merge vars preserved, no fabrication | 490 tokens; subject+body correctly parsed; `{{firstName}}`/`{{company}}` present; fabricationWarning=false | PASS |
| 6 | `POST .../launch/`, wait for real job queue | Job claimed and processed | Confirmed via `/api/admin/health` (jobRunner:true) + job status transitioned pending→completed | PASS |
| 7 | Real send attempt against genuinely-misconfigured SMTP | status=failed, no false success | Both recipients correctly marked failed; `[EMAIL ERROR] getaddrinfo ENOTFOUND smtp.example.com` (same pre-existing env gap as use case 2) | PASS |
| 8 | Unsubscribe tokens created before the (failed) send attempt | 2 real tokens | Confirmed via DB query — proves personalization/tracking code executed before the unrelated SMTP failure | PASS |
| 9 | Standalone render-pipeline verification (render→pixel→links→unsubscribe) | Correct composed HTML | `renderTemplate` correctly substituted "Alice Test"/"Acme Co"; pixel/link-rewrite/unsubscribe all correctly appended in sequence | PASS |
| 10 | Real open-tracking pixel hit (`GET /api/t/o/:id`, follow redirect) | recipient.status=opened, openedAt set | Confirmed via DB query | PASS |
| 11 | Real click-tracking redirect (`GET /api/t/c/:id`) | recipient.status=clicked, clickedAt set | Confirmed via DB query | PASS |
| 12 | `campaign.totalOpened` after a real pixel hit | Increments to 1 | **First observation: stayed 0 (real bug)**; fixed `logOpenEvent`; re-verified: 0→1 on a fresh recipient's real pixel hit | FOUND BUG, FIXED |
| 13 | Behavioral segmentation on a campaign with 1 clicked + 1 failed recipient | 0 non-openers (the clicked one counts as sent+opened) | **First observation: 0 sent recipients found (real bug, clicked status excluded)**; fixed status filter; re-verified: 1 sent, 0 non-openers | FOUND BUG, FIXED |
| 14 | Mint campaign share link, fetch public report, no auth | 200, real send/open/click/variant data | Confirmed, both A/B variants present with correct subjects | PASS |
| 15 | Public HTML share page | 200 | HTTP 200 | PASS |
| 16 | Unauthenticated materialize-recipients rejected (negative) | 401 | Confirmed | PASS |
| 17 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` across contacts/lists/email_templates/campaigns | PASS |

**15/17 passed on first attempt; 2 real bugs found live and fixed** (campaign open/click counters
never incrementing; behavioral segmentation excluding already-engaged recipients from the sent
cohort) — on top of 4 more real bugs found before/during build (recipient materialization never
wired, tracking pixel/links never wired, dead unique constraint making claimed idempotency false,
and a pre-existing unrelated bug in the campaign detail page's response-shape handling). 6 real
bugs total, all disclosed in the architecture note, none hidden.
