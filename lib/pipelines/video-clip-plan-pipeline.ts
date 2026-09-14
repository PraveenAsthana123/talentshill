import { getVideoProjectById } from '@/lib/db/video-project-queries';
import { getClipPlanById, getClipPlansForSource, setClipPlanReadiness } from '@/lib/db/video-clip-plan-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ClipRangeValidation { valid: boolean; reason: string }

// Pure, unit-tested. A real range check against the source video's own
// real duration, when known -- never allows a clip plan to claim a
// timestamp range beyond what the source video actually is.
export function validateClipRange(startSeconds: number, endSeconds: number, sourceDurationSeconds: number | null): ClipRangeValidation {
  if (endSeconds <= startSeconds) return { valid: false, reason: 'end must be after start' };
  if (startSeconds < 0) return { valid: false, reason: 'start cannot be negative' };
  if (sourceDurationSeconds !== null && endSeconds > sourceDurationSeconds) {
    return { valid: false, reason: `end (${endSeconds}s) exceeds the source video's real duration (${sourceDurationSeconds}s)` };
  }
  return { valid: true, reason: 'within range' };
}

export function computeClipDuration(startSeconds: number, endSeconds: number): number {
  return Math.max(0, endSeconds - startSeconds);
}

export interface ClipReadinessInput {
  title: string;
  startSeconds: number;
  endSeconds: number;
  sourceDurationSeconds: number | null;
  targetPlatform: string;
  targetAspectRatio: string;
  notes: string | null;
  status: 'planned' | 'ready_for_edit' | 'delivered';
  outputUrl: string | null;
}

// Pure, unit-tested, deterministic checklist -- same pattern as
// video-project-readiness-pipeline.ts. 25 points each: valid real
// range / target platform+aspect ratio set / notes present / output
// URL set once status is 'delivered' (n/a otherwise).
export function computeClipReadinessScore(input: ClipReadinessInput): number {
  const range = validateClipRange(input.startSeconds, input.endSeconds, input.sourceDurationSeconds);
  const rangeScore = range.valid ? 25 : 0;

  const targetScore = input.targetPlatform && input.targetAspectRatio ? 25 : 0;

  const notesScore = input.notes && input.notes.trim().length > 0 ? 25 : 0;

  const needsOutput = input.status === 'delivered';
  const outputScore = !needsOutput || (!!input.outputUrl && input.outputUrl.trim().length > 0) ? 25 : 0;

  return rangeScore + targetScore + notesScore + outputScore;
}

export interface ClipPlanStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ClipPlanReadinessResult { runId: string; stages: ClipPlanStageResult[]; score: number; clipPlanId: string | null; rangeValid: boolean }

export async function runClipPlanReadinessPipeline(params: { clipPlanId: string; triggeredBy?: string | null }): Promise<ClipPlanReadinessResult> {
  const stages: ClipPlanStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'video_editing', operationName: 'pipeline_clip_plan_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const clip = getClipPlanById(params.clipPlanId);
  if (!clip) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'clip plan not found' });
    return { runId, stages, score: 0, clipPlanId: null, rangeValid: false };
  }

  const source = getVideoProjectById(clip.sourceProjectId);
  const range = validateClipRange(clip.startSeconds, clip.endSeconds, source?.durationSeconds ?? null);
  stages.push({ stage: 'validate_range', input: { start: clip.startSeconds, end: clip.endSeconds, sourceDuration: source?.durationSeconds ?? null }, process: "Check the clip's real timestamp range against the source video's real duration", output: range, status: 'ok' });

  const score = computeClipReadinessScore({
    title: clip.title, startSeconds: clip.startSeconds, endSeconds: clip.endSeconds,
    sourceDurationSeconds: source?.durationSeconds ?? null, targetPlatform: clip.targetPlatform,
    targetAspectRatio: clip.targetAspectRatio, notes: clip.notes, status: clip.status, outputUrl: clip.outputUrl,
  });
  setClipPlanReadiness(params.clipPlanId, score);
  stages.push({ stage: 'write_score', input: { score }, process: 'Update video_clip_plans.readiness_score (real, previously-unused field)', output: { readinessScore: score }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score, rangeValid: range.valid } });
  return { runId, stages, score, clipPlanId: params.clipPlanId, rangeValid: range.valid };
}

export interface RepurposingCoverageResult {
  runId: string;
  stages: ClipPlanStageResult[];
  sourceProjectId: string | null;
  clipCount: number;
  totalClipSeconds: number;
  sourceDurationSeconds: number | null;
  coverageRatio: number | null; // real totalClipSeconds / sourceDurationSeconds, null if source duration unknown
  invalidRangeCount: number;
}

// Real, deterministic aggregate: how much of a source video's real
// duration is actually covered by real planned clips, and how many of
// those clips have a real valid range. Never a fabricated "repurposing
// completeness" number -- coverageRatio is null (not a guessed
// percentage) when the source's own duration was never entered.
export async function runRepurposingCoveragePipeline(params: { sourceProjectId: string; triggeredBy?: string | null }): Promise<RepurposingCoverageResult> {
  const stages: ClipPlanStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'video_editing', operationName: 'pipeline_repurposing_coverage', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const source = getVideoProjectById(params.sourceProjectId);
  if (!source) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'source project not found' });
    return { runId, stages, sourceProjectId: null, clipCount: 0, totalClipSeconds: 0, sourceDurationSeconds: null, coverageRatio: null, invalidRangeCount: 0 };
  }

  const clips = getClipPlansForSource(params.sourceProjectId);
  stages.push({ stage: 'fetch_clip_plans', input: { sourceProjectId: params.sourceProjectId }, process: 'Load real clip plans for this source video', output: { clipCount: clips.length }, status: 'ok' });

  let totalClipSeconds = 0;
  let invalidRangeCount = 0;
  for (const clip of clips) {
    const range = validateClipRange(clip.startSeconds, clip.endSeconds, source.durationSeconds ?? null);
    if (!range.valid) { invalidRangeCount++; continue; }
    totalClipSeconds += computeClipDuration(clip.startSeconds, clip.endSeconds);
  }

  const coverageRatio = source.durationSeconds && source.durationSeconds > 0 ? Math.round((totalClipSeconds / source.durationSeconds) * 100) / 100 : null;
  stages.push({
    stage: 'compute_coverage',
    input: { rule: 'sum(valid clip durations) / source.durationSeconds, null if source duration unknown' },
    process: 'Real aggregate of real clip durations against the real source duration',
    output: { totalClipSeconds, coverageRatio, invalidRangeCount },
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { clipCount: clips.length, coverageRatio } });
  return { runId, stages, sourceProjectId: params.sourceProjectId, clipCount: clips.length, totalClipSeconds, sourceDurationSeconds: source.durationSeconds, coverageRatio, invalidRangeCount };
}
