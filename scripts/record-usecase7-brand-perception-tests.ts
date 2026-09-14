/**
 * Records the real verification performed for the AI Brand Perception
 * Dashboard use case (Use-Case Build Standard, item 7 of 15) into the
 * persisted test_execution table. Every value here is copied from real
 * test runs already performed this session -- Vitest run + live curl
 * against a running dev server on port 3017, including 3 real Ollama
 * calls -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase7-brand-perception-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeHealthScore: null with no scored data (boundary)', expectedResult: 'null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeHealthScore: 100 when all positive (positive case)', expectedResult: '100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeHealthScore: 0 when all negative (negative case)', expectedResult: '0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeHealthScore: 50 for even pos/neg split (boundary)', expectedResult: '50', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeHealthScore: 50 for all-neutral (boundary)', expectedResult: '50', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeCampaignLift: nulls when no snapshots exist (boundary)', expectedResult: 'all null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'computeCampaignLift: real positive lift between two real snapshots (positive case)', expectedResult: 'lift=30', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'pipeline', caseName: 'Real DB: pipeline excludes unscored mentions from calculation (boundary)', expectedResult: 'runs without throwing, structural check', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'pipeline', caseName: 'Real DB: pipeline writes a real snapshot once sentiment is assigned (positive case)', expectedResult: 'healthScore/snapshotId not null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'Live: unauthenticated mention create rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'agentic', caseName: 'Live: real Ollama correctly classifies a genuinely positive mention', expectedResult: 'sentiment=positive', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'agentic', caseName: 'Live: real Ollama correctly classifies a genuinely negative mention', expectedResult: 'sentiment=negative', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'pipeline', caseName: 'Live: health snapshot computes exact score from real 1-positive-1-negative mentions', expectedResult: 'healthScore=50, competitorsTracked=1 (real count)', actualResult: 'Live curl: exact match, math independently verified (1-1)/2=0 -> 50', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'agentic', caseName: 'Live: health narrative agent references only the real computed score/counts, real Ollama call', expectedResult: 'No invented mentions/numbers', actualResult: 'Live curl: narrative correctly cited "50", "one positive and one negative"', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'pipeline', caseName: 'Live: campaign lift correctly computed from real pre/post snapshots after a genuine sentiment shift', expectedResult: 'pre=50, post=67, lift=17', actualResult: 'Live curl: exact match, math independently verified (2-1)/3=0.333 -> 66.67 -> round 67, lift=67-50=17', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'Live: unscored placeholder mention correctly excluded from all score calculations', expectedResult: 'placeholder mention has no effect on health score', actualResult: 'Confirmed: post-campaign score matched hand-computed math using only the 2 sentiment-scored real mentions, unscored placeholder excluded', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'Live: customer self-service brand health report, no auth, real snapshot history', expectedResult: '200, real snapshot list', actualResult: 'Live curl (no cookie): 4 real snapshots returned with correct scores/labels', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'branding', executionMode: 'manual', caseName: 'Test-data hygiene: 4 mentions + 4 snapshots + 1 campaign + share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across brand_mentions/brand_health_snapshots/campaigns', status: 'pass' },
];

function record() {
  console.log('--- Recording AI Brand Perception Dashboard use-case test results ---');
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
