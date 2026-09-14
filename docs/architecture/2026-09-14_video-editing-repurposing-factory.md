# Architecture: Video Repurposing Factory (video_editing)

**Use case:** #13 of the Use-Case Build Standard build-out — real
source-video-to-derivative-clip-plan modeling with real range
validation and coverage scoring.

## Research first

A background agent fully mapped the pre-existing `video_editing`
module (and the adjacent `reels_management`/`youtube`/`videos`
modules, to confirm no scope overlap) before any code was written. It
confirmed:

- `videoProjects` models **one flat, standalone video-production-job
  record only** — no self-reference, no child-clip concept, no
  source/derivative relationship anywhere in this codebase.
- `reels_management` (`reels` table) is a **separate, already-complete
  scheduling/publishing tracker** for already-conceived short-form
  pieces — it has no source-video concept either, so building
  repurposing under `video_editing` does not duplicate it.
- **No real video-processing/transcoding integration exists anywhere**
  (confirmed via repo-wide search: zero FFmpeg hits, no such
  dependency in `package.json`).
- `module_registry.api_route_count` was stale for **both**
  `video_editing` (8 vs. real 6) and `reels_management` (8 vs. real
  7) — same recurring issue class already found and fixed in
  `broadcasts`/`appointments`, corrected for both here.
- No `report-share` resolver existed for `video_editing` — a real gap,
  closed alongside this use case.

This confirmed a real source→derivative-clip-plan layer was genuinely
new, non-duplicative work.

## Scope decisions

- **A real new child entity**, `videoClipPlans`, linked to an existing
  `videoProjects` row by a real foreign key (`sourceProjectId`) — any
  existing project can act as a source, no separate "is this a
  source" flag needed.
- **Clip plans are real, admin-entered planning metadata only** —
  timestamp range, target platform, target aspect ratio, notes,
  status. **Never a fabricated render.** `status` is limited to
  planning states (`planned` → `ready_for_edit` → `delivered`);
  `delivered` means an admin manually attached a real `outputUrl` they
  produced externally, never an automatic "processing complete."
- **Range validation is a real, disclosed check against the source's
  own real duration** — `validateClipRange` (pure, unit-tested) flags
  a clip whose end exceeds the source's real `durationSeconds`. When
  the source duration was never entered, no bound check is possible
  (disclosed, not silently assumed valid).
- **Coverage is a real ratio, never a fabricated completeness
  score** — `runRepurposingCoveragePipeline` sums real valid-clip
  durations against the source's real duration; returns `null` (not a
  guessed percentage) when the source duration is unknown.
- **The clip-idea agent is explicitly told it has not watched the
  video** — no transcript/frame analysis exists anywhere in this
  codebase, so it is grounded only in the source's real title/
  strategy-notes/duration/existing-coverage metadata, and its prompt
  requires it to frame suggestions as unverified ideas for a human
  editor to confirm against the actual footage — never claiming
  specific quotes or content it has no access to. Fabrication-guard
  applied as a backstop.

## What was built

- Schema: `videoClipPlans` (real FK to `videoProjects`, real range,
  platform/aspect targets, planning-only status, computed readiness).
- `lib/pipelines/video-clip-plan-pipeline.ts`: `validateClipRange`,
  `computeClipDuration`, `computeClipReadinessScore` (all pure,
  unit-tested) + `runClipPlanReadinessPipeline` (per-clip) +
  `runRepurposingCoveragePipeline` (per-source aggregate).
- `lib/agents/video-repurposing-idea-agent.ts`: Ollama clip-idea
  drafter, grounded in real metadata only, fabrication-guard applied.
- API: per-source clip list/create, per-clip get/update/delete,
  per-clip readiness, per-source coverage, per-source ideas,
  `share-link`; `dashboard`/`report` extended with real clip KPIs.
- Customer self-service: `lib/report-share/resolvers/video-editing.ts`
  (this module previously had none) + `app/report/video-editing/[token]/page.tsx`.
- Admin UI: ManualTab gained a "Clips" link per project; a new project
  detail page for creating clip plans, scoring them, running coverage,
  and requesting AI clip ideas; Dashboard/Report/Governance tabs
  extended.

## Also corrected two stale registry fields

`module_registry.api_route_count` for both `video_editing` (8 → 13,
after adding the 7 new routes to the real 6 pre-existing) and
`reels_management` (8 → 7, no new routes added there, just the
existing stale count corrected while researching the scope boundary).

## Deliberately not built

- No real video-processing/transcoding/rendering (disclosed, not
  faked).
- No automatic clip-boundary detection (e.g. scene-cut analysis) — an
  admin enters real timestamp ranges by hand.
- No merge with `reels_management`'s publishing-calendar concept —
  a delivered clip plan is not automatically turned into a `reels`
  row; that would be a separate, deliberate hand-off a future use case
  could add.
