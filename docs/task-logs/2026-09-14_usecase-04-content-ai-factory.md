# Task Log: Use Case 4/15 — AI Content Factory

**Date:** 2026-09-14
**Module:** content
**Source:** Use Case Build Standard, item 4

## What was built

1. Schema: `contentPersonas`, `contentTopics`, `contentEngagementMetrics`.
2. Query layers: persona/topic CRUD, engagement aggregation.
3. `lib/agents/content-generation-agent.ts` — real Ollama content
   generation grounded in persona/topic, always drafts, never publishes.
4. `lib/pipelines/content-performance-pipeline.ts` — `classifyContentAction`
   (pure) + deterministic pipeline.
5. `lib/agents/content-performance-agent.ts` — Ollama narrative.
6. API routes: `personas/`, `topics/` (+ `/generate`), `engagement/`,
   `performance/` (+ `/agentic`), `share-link/`.
7. Report-share resolver + dedicated public page.
8. UI: ManualTab (personas, editorial calendar, engagement logging,
   share-link), PipelineTab (performance table), AgenticTab (performance
   narrative), Dashboard/Report tabs updated.
9. Tests: 9 new Vitest tests. Live: 19 cases recorded to
   `test_execution`, including 3 real Ollama calls.

## Most significant finding this use case

Unlike every prior agent this session, the content-generation agent's
anti-fabrication instruction was **not reliably followed by the model**
— live-verified the local model invented specific percentages and a
fake customer case study despite explicit prompting not to. This is a
genuine model-capability limitation, not a prompt-wording bug. Responded
with a deterministic backstop (`containsSuspiciousStatistics`) that
flags any generated draft containing a number pattern with an explicit
warning banner, rather than trusting the model's compliance. Documented
prominently in the architecture note rather than treated as a minor
detail — this is the kind of finding the Use-Case Build Standard's
"live verification, not just unit tests pass" requirement exists to
catch.

## Deliberately not built

No bridge to the public `blogPosts` table — promoting factory drafts to
the public blog remains a manual, separate decision.

## Verification

- `npx tsc --noEmit`: clean throughout.
- `npx vitest run`: 69/69 passed (57 pre-existing + 12 new: 6 written
  initially, 3 more added for the fabrication-detection backstop found
  during live testing).
- Live dev server (port 3014): full flow including 3 real local Ollama
  calls (2 content generation, 1 performance narrative), verified both
  branches of the fabrication-warning backstop.
- `module_registry` updated.

## Status

Done per the Use-Case Build Standard's definition of done, with the
fabrication-safeguard finding disclosed as an open, real limitation of
the local model for open-ended generation tasks (as distinct from
narrow narration tasks, which have worked reliably all session).
