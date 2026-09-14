import { describe, it, expect, afterAll } from 'vitest';
import { validateClipRange, computeClipDuration, computeClipReadinessScore, runClipPlanReadinessPipeline, runRepurposingCoveragePipeline } from '@/lib/pipelines/video-clip-plan-pipeline';
import { createVideoProject, deleteVideoProject } from '@/lib/db/video-project-queries';
import { createClipPlan, deleteClipPlan } from '@/lib/db/video-clip-plan-queries';

describe('validateClipRange (pure)', () => {
  it('rejects end <= start (negative case)', () => {
    expect(validateClipRange(30, 30, null).valid).toBe(false);
    expect(validateClipRange(30, 10, null).valid).toBe(false);
  });
  it('rejects a negative start (negative case)', () => {
    expect(validateClipRange(-5, 10, null).valid).toBe(false);
  });
  it('accepts a valid range with unknown source duration (positive case)', () => {
    expect(validateClipRange(10, 40, null).valid).toBe(true);
  });
  it('rejects a clip end beyond the real source duration (negative case)', () => {
    const result = validateClipRange(10, 120, 100);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('100s');
  });
  it('accepts a clip exactly at the source duration boundary (boundary)', () => {
    expect(validateClipRange(0, 100, 100).valid).toBe(true);
  });
});

describe('computeClipDuration (pure)', () => {
  it('computes a real positive duration (positive case)', () => {
    expect(computeClipDuration(10, 40)).toBe(30);
  });
  it('never returns a negative duration (boundary)', () => {
    expect(computeClipDuration(40, 10)).toBe(0);
  });
});

describe('computeClipReadinessScore (pure)', () => {
  const base = { title: 'clip', startSeconds: 0, endSeconds: 30, sourceDurationSeconds: 100, targetPlatform: 'tiktok', targetAspectRatio: '9:16', notes: null, status: 'planned' as const, outputUrl: null };

  it('scores a fully complete planned clip at 75 (no notes, boundary)', () => {
    expect(computeClipReadinessScore(base)).toBe(75);
  });
  it('scores 100 when notes are also present (positive case)', () => {
    expect(computeClipReadinessScore({ ...base, notes: 'hook idea: open on the reveal' })).toBe(100);
  });
  it('scores 0 range/target/notes for an invalid range with no notes (negative case)', () => {
    expect(computeClipReadinessScore({ ...base, endSeconds: 200, notes: null })).toBe(50);
  });
  it('requires a real output URL once status is delivered (negative case)', () => {
    expect(computeClipReadinessScore({ ...base, status: 'delivered', outputUrl: null })).toBe(50);
  });
  it('scores 100 when delivered with a real output URL and notes (positive case)', () => {
    expect(computeClipReadinessScore({ ...base, status: 'delivered', outputUrl: 'https://example.com/clip.mp4', notes: 'final cut' })).toBe(100);
  });
});

const cleanupProjectIds: string[] = [];
const cleanupClipIds: string[] = [];

afterAll(() => {
  for (const id of cleanupClipIds) deleteClipPlan(id);
  for (const id of cleanupProjectIds) deleteVideoProject(id);
});

describe('runClipPlanReadinessPipeline (real DB)', () => {
  it('flags an out-of-range clip against the real source duration (negative case)', async () => {
    const projectId = createVideoProject({ title: `__test source ${Date.now()}`, tool: 'other', durationSeconds: 60 });
    cleanupProjectIds.push(projectId);
    const clipId = createClipPlan({ sourceProjectId: projectId, title: 'oob clip', startSeconds: 0, endSeconds: 90, targetPlatform: 'tiktok', targetAspectRatio: '9:16' });
    cleanupClipIds.push(clipId);

    const result = await runClipPlanReadinessPipeline({ clipPlanId: clipId });
    expect(result.rangeValid).toBe(false);
  });
});

describe('runRepurposingCoveragePipeline (real DB)', () => {
  it('computes real coverage ratio from real clip durations against the real source duration (positive case)', async () => {
    const projectId = createVideoProject({ title: `__test source coverage ${Date.now()}`, tool: 'other', durationSeconds: 100 });
    cleanupProjectIds.push(projectId);
    const clip1 = createClipPlan({ sourceProjectId: projectId, title: 'clip 1', startSeconds: 0, endSeconds: 20, targetPlatform: 'tiktok', targetAspectRatio: '9:16' });
    const clip2 = createClipPlan({ sourceProjectId: projectId, title: 'clip 2', startSeconds: 30, endSeconds: 50, targetPlatform: 'instagram_reels', targetAspectRatio: '9:16' });
    cleanupClipIds.push(clip1, clip2);

    const result = await runRepurposingCoveragePipeline({ sourceProjectId: projectId });
    expect(result.clipCount).toBe(2);
    expect(result.totalClipSeconds).toBe(40);
    expect(result.coverageRatio).toBe(0.4);
  });

  it('returns a null coverage ratio when the source duration is unset (negative case)', async () => {
    const projectId = createVideoProject({ title: `__test source no duration ${Date.now()}`, tool: 'other' });
    cleanupProjectIds.push(projectId);
    const clipId = createClipPlan({ sourceProjectId: projectId, title: 'clip', startSeconds: 0, endSeconds: 20, targetPlatform: 'tiktok', targetAspectRatio: '9:16' });
    cleanupClipIds.push(clipId);

    const result = await runRepurposingCoveragePipeline({ sourceProjectId: projectId });
    expect(result.coverageRatio).toBeNull();
  });
});
