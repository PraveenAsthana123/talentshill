# Architecture: YouTube Channel Growth Engine (youtube)

**Use case:** #14 of the Use-Case Build Standard build-out — real
channel-level subscriber/view snapshot tracking with a real growth
delta, distinct from the pre-existing per-video publishing tracker.

## Research first

A background agent fully mapped the pre-existing `youtube` module
before any code was written. It confirmed:

- `youtubeVideos` models **one flat video-publishing-status record
  only** — no channel entity, no subscriber/view field, no time-series
  concept anywhere in schema, queries, pipelines, agents, or UI.
- **No real YouTube Data API/OAuth integration exists anywhere** —
  every existing mention of "YouTube Data API" in the codebase is a
  disclosure that it's absent (confirmed via repo-wide grep for
  subscriber/watch-time/retention/Analytics-API usage — zero hits).
- `module_registry.api_route_count` was stale (8 vs. the real 5
  pre-existing routes) — the fifth occurrence of this same issue
  class this session (after broadcasts, appointments, video_editing,
  reels_management), corrected here.
- No `report-share` resolver existed for `youtube` — a real gap,
  closed alongside this use case.

This confirmed real channel-level growth tracking was genuinely new,
non-duplicative work.

## Scope decisions

- **Channel metrics are real, admin-entered point-in-time snapshots**
  (`youtubeChannelSnapshots`) — subscriber count, total views, total
  watch-time minutes, a real snapshot date, optional notes. The admin
  copies these numbers by hand from their own real YouTube Studio
  dashboard. **No live API call, no OAuth flow, no "Connect Channel"
  button that pretends to fetch real data** — that would break the
  honesty boundary this entire session has maintained.
- **Growth is always a real, deterministic diff between the two most
  recent real snapshots** (`computeGrowthDelta`, pure, unit-tested) —
  never an interpolated or simulated trend. When fewer than 2
  snapshots exist, the pipeline reports `hasEnoughData: false` rather
  than guessing a number.
- **`subscribersPerDay` is `null`, not a fabricated rate**, when two
  snapshots share the same real date (avoids a divide-by-zero
  disguised as a real number).
- **The growth-narrative agent is grounded strictly in the real
  computed delta** and is instructed never to invent a figure not
  given to it. Live verification found the model correctly cited only
  the real numbers but phrased the total 5000-view delta ambiguously
  as "approximately 5000 per day" in one run — a real, disclosed
  small-model interpretation limitation (not a fabricated/invented
  number; the fabrication-guard regex doesn't catch phrasing
  ambiguity, only invented % / $ patterns). Documented honestly in
  the evidence file rather than presented as a clean pass.

## What was built

- Schema: `youtubeChannelSnapshots`.
- `lib/pipelines/youtube-channel-growth-pipeline.ts`:
  `computeGrowthDelta` (pure, unit-tested) + the real pipeline that
  loads the 2 most recent real snapshots and computes their diff.
- `lib/agents/youtube-growth-agent.ts`: Ollama growth-narrative agent
  grounded in the real delta, fabrication-guard applied.
- API: `channel-snapshots` list/create/delete, `channel-growth`
  (pipeline), `channel-growth/agentic` (agent), `share-link`;
  `dashboard`/`report` extended with real channel KPIs.
- Customer self-service: `lib/report-share/resolvers/youtube.ts`
  (this module previously had none) + `app/report/youtube/[token]/page.tsx`.
- Admin UI: ManualTab gained a "Channel Snapshots" section with a
  create form and delete action; PipelineTab gained a "Run Growth
  Analysis" section; AgenticTab gained a growth-narrative section;
  Dashboard/Report/Governance tabs extended.

## Also corrected a stale registry field

`module_registry.api_route_count` for `youtube` was recorded as 8;
the real pre-existing route-file count was 5. Corrected alongside
adding the 7 new channel-growth routes (12 total).

## Deliberately not built

- No real YouTube Data API/OAuth integration (disclosed, not faked).
- No automatic snapshot capture on a schedule — an admin enters real
  numbers by hand, same disclosure discipline as every other module
  this session with no real third-party API credentials.
- No per-video view/like/comment metrics — that would require the
  same absent live API; only channel-level, admin-entered totals are
  in scope.
