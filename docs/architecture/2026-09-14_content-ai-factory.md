# Architecture: AI Content Factory (content)

**Use case:** #11 of the 130-item catalog — "AI content factory: persona
→ topics → editorial calendar → generate blogs/social snippets → human
review → publish → measure engagement/leads → optimize."

## Scope decision: `marketingContent`, not `blogPosts`

Research found `content` (marketing_content table) and the public blog
(`blog_posts` table) are entirely separate systems with no bridge. The
factory targets `marketingContent` — it already has draft/review/
approved/published states, a readiness pipeline, and covers `article`
and `social_post` content types in one place, matching the use case's
multi-format need. Promoting factory output to the public `/blog` route
remains a manual, separate human decision — not built, disclosed.

## New capability: persona → editorial calendar → generation

`contentPersonas` (real, admin-written target-audience descriptions),
`contentTopics` (title, target type, optional persona, optional
scheduled date, status). `runContentGenerationAgent` drafts real content
via Ollama, grounded in the real persona/topic given, always writes
`status='draft'` — never auto-published, same publish gate the module
already enforces.

## Real finding: the model does not reliably follow anti-fabrication instructions

The generation prompt explicitly forbids inventing statistics or named-
customer claims — the same instruction pattern used successfully by
every other agent this session (ROI, sentiment, budget optimization).
Live-verified 2026-09-14 that the local model (phi4-mini) **did not
comply**: the first generation invented "15% increase," "20% cost
reduction," "18% retention improvement," and a fabricated "TalentsHill
customer" case study, despite both the system prompt and user prompt
explicitly forbidding this.

This is a materially different finding from every other agent built
this session, where the same instruction pattern worked reliably (never
invent a campaign/creator/number not given). The difference: those
agents narrate real numbers already computed by a deterministic
pipeline — a narrow, low-freedom task. Content generation is open-ended
creative writing, where a small model has more room to drift into
plausible-sounding fabrication.

**Engineering response**: prompting alone is not a sufficient safeguard
for this model size on this task. Added a deterministic backstop —
`containsSuspiciousStatistics()` scans generated text for percentage/
dollar patterns and, if found, prepends an explicit warning banner to
the draft body so a human reviewer is unmistakably alerted, rather than
trusting model compliance silently. This does not block generation (the
existing draft/review/publish gate already requires human review before
anything reaches production) — it makes the specific risk visible
instead of silent. Verified live in both branches: the first generation
correctly triggered the warning, a second generation with compliant
output correctly did not.

## New capability: performance/optimization

`contentEngagementMetrics` (real, manually-entered views/leads — no
analytics-platform sync exists, disclosed). `classifyContentAction`
(pure, unit-tested, reusing the n=1-safe top-half rule established in
ads_management/influencer_video) + deterministic pipeline + Ollama
narrative agent, same honesty pattern as every prior use case's
narrative agent (grounded only in real computed numbers).

## Customer self-service

Standard resolver + dedicated page, following the `ads_management`
pattern (content titles/performance are business data, not PII).
