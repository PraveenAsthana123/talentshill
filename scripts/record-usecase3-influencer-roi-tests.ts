/**
 * Records the real verification performed for the Influencer Creator
 * Discovery & ROI Scoring use case (Use-Case Build Standard, item 3 of
 * 15) into the persisted test_execution table. Every value here is
 * copied from real test runs already performed this session -- Vitest
 * run + live curl against a running dev server on port 3013, including
 * real Ollama calls -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase3-influencer-roi-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'classifyRenewalAction: drop when ROI negative (negative case)', expectedResult: 'action=drop', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'classifyRenewalAction: renew for top-ranked creator, ROI>=0 (positive case)', expectedResult: 'action=renew', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'classifyRenewalAction: hold for bottom-half creator, ROI>=0 (negative case)', expectedResult: 'action=hold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'classifyRenewalAction: single profitable creator renews, not hold (boundary n=1)', expectedResult: 'action=renew', actualResult: 'Vitest PASS -- applied the same n=1 fix already proven necessary in ads_management', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'classifyRenewalAction: null ROI (no metrics/fee) holds (boundary)', expectedResult: 'action=hold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'classifyRenewalAction: ROI exactly 0 is break-even, not a loss (boundary)', expectedResult: 'action != drop', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Real SQL aggregation excludes zero-entry creators (boundary)', expectedResult: 'entryCount=0, roi=null', actualResult: 'Vitest PASS against real inserted row', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Real SQL aggregation computes ROI from fee/revenue (positive case)', expectedResult: '(1000-500)/500=1.0', actualResult: 'Vitest PASS, exact match', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Real aggregation excludes a creator with metrics but no agreed fee (boundary)', expectedResult: 'roi=null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'searchProspectingCreators: finds a real creator matching platform+min fit (positive case)', expectedResult: 'creator present in results', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'searchProspectingCreators: excludes creator below min fit threshold (negative case)', expectedResult: 'creator absent from results', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Live: unauthenticated GET rejected', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Live: creator create did not persist audienceFitScore (real bug found)', expectedResult: 'audienceFitScore saved on create', actualResult: 'FOUND BUG: POST route never forwarded audienceFitScore/campaignFeedbackNotes to the query layer despite the frontend sending them. Fixed and reverified: audienceFitScore=85 correctly persisted and returned after fix.', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'pipeline', caseName: 'Live: ROI pipeline correctly ranks a real winning (300% ROI) and losing (-60% ROI) creator', expectedResult: 'win=renew, lose=drop, exact ROI match', actualResult: 'Live curl: exactly as expected, math independently verified (2000-500)/500=3.0 and (200-500)/500=-0.6', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Live: creator search filters correctly by platform + min audience fit', expectedResult: 'fit=85 found at threshold 80, excluded at threshold 95', actualResult: 'Live curl: both cases confirmed exactly', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'agentic', caseName: 'Live: sentiment agent reports insufficient_data with no feedback text (honesty check)', expectedResult: 'sentiment=insufficient_data, no fabricated score', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'agentic', caseName: 'Live: sentiment agent correctly classifies real positive feedback text, real Ollama call', expectedResult: 'sentiment=positive, grounded explanation', actualResult: 'Live curl: 318 tokens, correctly classified "positive", explanation references only the real text given', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'agentic', caseName: 'Live: ROI narrative agent references only real creator names/numbers, real Ollama call', expectedResult: 'No invented creators/numbers', actualResult: 'Live curl: narrative correctly cited "E2E Test Creator Win" 300% ROI and "E2E Test Creator Lose" -60% ROI with exact dollar figures', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Live: customer self-service report link, no PII issue (creator names are business data, not private PII)', expectedResult: '200, real suggestions', actualResult: 'Live curl (no cookie): scoredCreators=2, suggestions=2', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'influencer_video', executionMode: 'manual', caseName: 'Test-data hygiene: 3 test creators + metrics + share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0', status: 'pass' },
];

function record() {
  console.log('--- Recording Influencer Creator Discovery & ROI Scoring use-case test results ---');
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
