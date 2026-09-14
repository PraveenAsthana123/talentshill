/**
 * Records the real verification performed for the Video Repurposing
 * Factory use case (Use-Case Build Standard, item 13 of 15) into the
 * persisted test_execution table. Every value here is copied from real
 * test runs already performed this session -- Vitest run + live curl
 * against a running dev server on port 3023, including a real local
 * Ollama call -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase13-video-repurposing-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'validateClipRange: rejects end<=start (negative case)', expectedResult: 'valid=false', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'validateClipRange: rejects a negative start (negative case)', expectedResult: 'valid=false', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'validateClipRange: accepts a valid range with unknown source duration (positive case)', expectedResult: 'valid=true', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'validateClipRange: rejects a clip end beyond the real source duration (negative case)', expectedResult: 'valid=false, reason cites the real duration', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'validateClipRange: accepts a clip exactly at the source duration boundary (boundary)', expectedResult: 'valid=true', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipDuration: real positive duration (positive case)', expectedResult: '30', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipDuration: never negative (boundary)', expectedResult: '0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipReadinessScore: complete planned clip without notes scores 75 (boundary)', expectedResult: '75', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipReadinessScore: complete clip with notes scores 100 (positive case)', expectedResult: '100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipReadinessScore: invalid range with no notes scores 50 (negative case)', expectedResult: '50', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipReadinessScore: delivered with no real output URL scores 50 (negative case)', expectedResult: '50', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'computeClipReadinessScore: delivered with a real output URL and notes scores 100 (positive case)', expectedResult: '100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'pipeline', caseName: 'Real DB: clip readiness pipeline flags an out-of-range clip against the real source duration (negative case)', expectedResult: 'rangeValid=false', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'pipeline', caseName: 'Real DB: coverage pipeline computes real ratio from real clip durations (positive case)', expectedResult: 'clipCount=2, totalClipSeconds=40, coverageRatio=0.4', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'pipeline', caseName: 'Real DB: coverage pipeline returns null ratio when source duration unset (negative case)', expectedResult: 'coverageRatio=null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Live: unauthenticated clip create rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Live: create real source video (120s) + 3 real clip plans (2 valid, 1 out-of-range)', expectedResult: '4x201', actualResult: 'Live curl: all created', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'pipeline', caseName: 'Live: clip readiness scores exactly (100/50/100)', expectedResult: 'clip1=100, clip2=50 (rangeValid=false), clip3=100', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'pipeline', caseName: 'Live: coverage pipeline aggregates exactly across the real 3-clip scenario', expectedResult: 'clipCount=3, totalClipSeconds=60, coverageRatio=0.5, invalidRangeCount=1', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'agentic', caseName: 'Live: clip-idea agent grounds suggestions in real source metadata, discloses it has not watched the footage (real Ollama call)', expectedResult: 'fabricationWarning=false, explicit human-verify disclaimer present', actualResult: 'Live curl: fabricationWarning=false, response explicitly said "A human editor should verify the exact content"', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Live: dashboard KPIs reflect real repurposing coverage', expectedResult: 'totalClipPlans=3, deliveredClips=0, avgClipReadinessScore=83', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Live: report includes real per-clip rows with correct source/platform/readiness', expectedResult: '3 rows, correct sourceTitle/durationSeconds/readinessScore', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Live: customer self-service report is aggregate-only', expectedResult: '200, counts only', actualResult: 'Live curl (no cookie): confirmed, only totals/status/platform counts returned', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'video_editing', executionMode: 'manual', caseName: 'Test-data hygiene: 1 project + 3 clip plans + 1 share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across video_projects/video_clip_plans/report_share_tokens', status: 'pass' },
];

function record() {
  console.log('--- Recording Video Repurposing Factory use-case test results ---');
  let created = 0, skipped = 0;
  for (const r of RECORDS) {
    const existing = db.select().from(schema.testExecution)
      .where(and(eq(schema.testExecution.moduleKey, r.moduleKey), eq(schema.testExecution.caseName, r.caseName)))
      .get();
    if (existing) { skipped++; continue; }
    recordTestExecution(r);
    created++;
  }
  console.log(`Created ${created}, skipped ${skipped} (already present).`);
}

record();
