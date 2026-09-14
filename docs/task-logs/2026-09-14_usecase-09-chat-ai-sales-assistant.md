# Task Log: Use Case 9/15 — AI Conversational Sales Assistant

**Date:** 2026-09-14
**Module:** chat
**Source:** Use Case Build Standard, item 9

## What was built

1. Dispatched a background research agent first to fully map the
   pre-existing `chat` module. Confirmed the visitor-facing responder
   is pure keyword matching (zero Ollama calls), the only existing
   Ollama call is a QA layer over human replies, `contactId` is never
   populated, and a second unconnected `features/chatbot/` widget
   exists that must not be conflated with this work.
2. Schema: `qualificationScore`, `qualificationTier` on `chatRequests`.
3. `chat-sales-qualification-pipeline.ts` — pure `detectBuyingSignals`
   + the real cross-signal pipeline, including auto contact creation.
4. `chat-sales-assistant-agent.ts` — real Ollama draft-reply agent,
   fabrication-guard applied.
5. API routes (`qualify`, `draft-reply`, `messages`, `share-link`),
   report-share resolver + public page, admin UI (Manual/detail-page/
   Dashboard/Report/Governance all extended).
6. Tests: 9 new Vitest tests (119/119 total). Live: 18 cases recorded
   to `test_execution`, including 1 real Ollama draft-reply call and a
   full real visitor-message-to-qualified-contact flow.

## Real bug found and fixed mid-build

The contact-auto-link was originally keyed off `chatSessions.visitorEmail`,
which research had already flagged as unpopulated by any real code path.
Verified this live: after a real qualifying visitor message, the session's
`visitorEmail` was still empty even though the email was right there in
the message text. Fixed by falling back to the real regex-matched email
from the conversation itself when the session field is empty. Without
this fix, the auto-contact-creation feature would have shipped completely
non-functional in real usage.

## Deliberately not built

Automatic email-capture flow (`captureEmail()` still uncalled); merging
with the separate submission-based `leads` scoring stack; replacing the
visitor-facing rule-based auto-responder with the new Ollama agent
(would change live site behavior for every visitor, out of scope).

## Verification

- `npx tsc --noEmit`: clean throughout.
- `npx vitest run`: 119/119 passed (9 new).
- Live dev server (port 3019): a real visitor message sent through the
  actual public `/api/chat` endpoint, scored exactly 80/100 hot
  (hand-verified: pricing+demo+timeline+contact_shared, no "buy"
  keyword), auto-created a real contact from the real typed email, and
  a real Ollama draft reply correctly declined to invent a specific
  price. Dashboard/report KPIs, transcript endpoint, and aggregate-only
  public report all verified. All test data (sessions/requests/messages/
  contacts/share token) deleted and confirmed gone via
  `sqlite3 SELECT COUNT(*)`, including residue from an earlier failed
  test cleanup (caught and cleaned as part of this pass).
- `module_registry` updated for `chat` (15 API routes).

## Status

Done per the Use-Case Build Standard's definition of done.
