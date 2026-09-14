# End-to-End Test Evidence — Use Case 9/15: AI Conversational Sales Assistant — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3019. Raw output:
`docs/testing/2026-09-14_usecase-09-chat-ai-sales-assistant-log.txt`.

All temp test data (3 sessions/requests/message pairs, 2 contacts, 1 share token)
deleted and confirmed gone via direct DB query — including residue from an
earlier Vitest run whose cleanup had crashed on an FK-ordering bug (fixed in
the test file, then both runs' data cleaned together).

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **119/119 passed** (110 pre-existing + 9 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/chat/requests/[id]/qualify` no cookie | 401 | Unauthorized | PASS |
| 2 | Real visitor sends a qualifying message via the actual public `/api/chat` endpoint | 200, session+request auto-created | Confirmed | PASS |
| 3 | Qualification pipeline scores the real message | score=80, tier=hot (4 of 5 signals; no "buy" keyword) | Exact match, hand-verified 4×20=80 | PASS |
| 4 | Hot conversation auto-creates a real contact from the real typed email | contactCreated=true, source=chat | Confirmed — closed a real gap (session.visitorEmail is never populated by any existing code path) | PASS |
| 5 | Draft-reply agent (real Ollama) grounds its reply, declines to invent a price | fabricationWarning=false | Confirmed, draft explicitly declined to quote a specific price | PASS |
| 6 | Conversation-transcript endpoint (new — detail page previously showed no messages) | 2 real messages | Confirmed | PASS |
| 7 | Dashboard KPIs reflect real qualification coverage | qualifiedRequests=3, hotRequests=2, contactsLinkedFromChat=2 | Exact match | PASS |
| 8 | Report includes per-request qualification tier/score/contact-linked | Correct values for the real hot request | Confirmed | PASS |
| 9 | Customer self-service report, no auth, aggregate-only | 200, counts only, no PII | Confirmed — no visitor email/name/content present | PASS |
| 10 | Public HTML share page | 200 | HTTP 200 | PASS |
| 11 | Cleanup: all test entities (incl. prior-run residue) deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**11/11 passed. One real bug found and fixed during build** (not a pre-existing
production bug, but a gap discovered while designing the feature): the contact-
auto-link initially depended on `chatSessions.visitorEmail`, which — per the
research phase — is never populated by any real code path in this codebase.
Verified live: after a real qualifying message, the session's `visitorEmail`
was indeed still empty despite the email being in the message text. Fixed by
falling back to the real regex-matched email from the conversation itself,
then re-verified live that the fallback correctly creates and links a contact.
