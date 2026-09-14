# Architecture: AI Conversational Sales Assistant (chat)

**Use case:** #9 of the Use-Case Build Standard build-out — a real
Ollama-backed conversational reply drafter plus real buying-signal
qualification that links a chat conversation to a sales record.

## Research first

A background agent fully mapped the pre-existing `chat` module before
any code was written. It confirmed:

- The full session/request/message/eval data model, human-admin triage/
  assign/respond workflow, and a five-check pattern-based message
  safety evaluator are all real and already built.
- The visitor-facing auto-responder (`lib/chat/response-engine.ts`) is
  pure keyword/regex branching — **zero calls to `ollamaChat()`
  anywhere in the visitor reply path**. The only existing Ollama call in
  this module is a QA/tone advisory layer over an already-sent human
  reply (`chat-response-safety-agent.ts`) — it never drafts or sends a
  reply itself.
- `chatRequests.contactId` exists but is never populated by any caller.
  The existing `leads` lead-scoring stack is entirely submission-based
  and has no chat integration point.
- A second, entirely separate, **unconnected** client-side chatbot
  widget (`features/chatbot/`) is mounted site-wide — it is also a
  keyword matcher with a simulated typing effect, has no DB
  persistence, and has nothing to do with the `chat` module or its
  RBAC scope. Documented in the Governance tab so it's never confused
  with this work.

This confirmed real conversational-reply generation and sales
qualification were both genuinely new, non-duplicative work.

## Scope decisions

- **Qualification scoring is deterministic keyword detection over the
  real conversation, never an LLM guess.** `detectBuyingSignals`
  scans real user-authored message content for 5 fixed signal
  categories (pricing interest, demo request, buying intent, timeline
  urgency, contact shared) — 20 points each, 0-100 composite, tiered
  cold/warm/hot. Pure and unit-tested.
- **A real gap had to be closed for the feature to function at all.**
  The contact-auto-link was originally designed to key off
  `chatSessions.visitorEmail` — but research confirmed
  `captureEmail()` has zero callers anywhere in the codebase, so that
  field is always empty in real usage and the feature would never
  fire. Fixed by falling back to the real email address the visitor
  actually typed (the same regex match already used for the
  `contact_shared` signal) when the session field is empty — never a
  phone-number match, since `contacts.email` is required. This was
  caught and fixed during build, not discovered as a stale gap later.
- **The draft-reply agent is advisory only, never auto-sent** — same
  discipline as market-research synthesis and campaign variant
  generation. An admin reviews the draft and explicitly clicks "Use as
  Response" before it goes anywhere near the existing Respond flow.
  Fabrication-guard applied (open-ended generation, not narration of a
  single number set) — after phi4-mini fabricated statistics in use
  case 4 despite explicit anti-fabrication prompting, prompting alone
  is not trusted as a sufficient guard on its own.
- **The request detail page never showed the conversation at all** —
  a real, necessary gap for either new feature (qualification review,
  draft-reply context) to be usable by an admin. Added a real
  transcript view backed by a new `GET .../messages` route.
- **The customer self-service report is aggregate-only** (counts and
  tier breakdown, zero visitor names/emails/conversation content) —
  same PII discipline as the `leads` and `contacts` resolvers.

## What was built

- Schema: `qualificationScore`, `qualificationTier` on `chatRequests`.
- `lib/pipelines/chat-sales-qualification-pipeline.ts`:
  `detectBuyingSignals` (pure, unit-tested) + the real pipeline that
  loads a request's real transcript, scores it, writes score/tier back,
  and (hot tier + real email only) creates/links a real contact.
- `lib/agents/chat-sales-assistant-agent.ts`: Ollama draft-reply agent
  grounded in the real transcript, fabrication-guard applied.
- API: per-request `qualify`, `draft-reply`, and `messages` routes;
  `dashboard`/`report` extended with real qualification KPIs;
  `share-link` route.
- Customer self-service: `lib/report-share/resolvers/chat.ts`
  (aggregate-only) + `app/report/chat/[token]/page.tsx`.
- Admin UI: ManualTab requests table gained a Qualification column;
  the request detail page gained a real conversation transcript, a
  qualification panel with per-signal breakdown, and a draft-reply
  panel with "Use as Response"; Dashboard/Report tabs extended;
  Governance tab documents the closed gap and the unrelated
  `features/chatbot/` widget.

## Deliberately not built

- No automatic email-capture flow (`captureEmail()` still has no real
  caller) — this use case works around that gap for qualification
  purposes rather than building a separate full capture UI, which is
  out of scope here.
- No wiring into the existing `leads` submission-based scoring stack —
  chat qualification is deliberately its own signal source, not a
  forced merge with a differently-shaped pipeline.
- The visitor-facing rule-based auto-responder (`response-engine.ts`)
  was not replaced with the new Ollama agent — that would change live
  site behavior for every visitor and is a materially larger, riskier
  change than this use case's scope of an admin-reviewed draft-reply
  assistant.
