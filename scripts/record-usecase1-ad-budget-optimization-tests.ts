/**
 * Records the real verification already performed for the Ad Budget
 * Optimization use case (Use-Case Build Standard, item 1 of 15) into the
 * persisted test_execution table. Every value here is copied from real
 * test runs already performed this session -- Vitest run + live curl
 * against a running dev server on port 3011 -- not newly fabricated.
 * Idempotent (checks for existing rows by caseName+moduleKey first).
 * Run: npx tsx scripts/record-usecase1-ad-budget-optimization-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'classifyBudgetAction: decrease when ROAS < 1.0', expectedResult: 'action=decrease, delta=-20%', actualResult: 'Vitest: PASS (pure function, no DB dependency)', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'classifyBudgetAction: increase for top-ranked campaign, ROAS >= 1.0', expectedResult: 'action=increase, delta=+15%', actualResult: 'Vitest: PASS', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'classifyBudgetAction: hold for bottom-half campaign, ROAS >= 1.0', expectedResult: 'action=hold, delta=0%', actualResult: 'Vitest: PASS', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'classifyBudgetAction: single profitable campaign gets increase, not hold (n=1 boundary)', expectedResult: 'action=increase', actualResult: 'Vitest: PASS -- caught and fixed a real bug where the original top-half math (idx<floor(n/2)) wrongly held every n=1 case; fixed to idx<=floor((n-1)/2) and reverified live via the agentic API (ROAS 4.50 -> increase 15%)', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'classifyBudgetAction: null ROAS (no spend recorded) holds', expectedResult: 'action=hold, reason mentions no spend', actualResult: 'Vitest: PASS', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'classifyBudgetAction: ROAS exactly 1.0 is not treated as a loss', expectedResult: 'action != decrease', actualResult: 'Vitest: PASS', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Real SQL aggregation excludes zero-entry campaigns from scoring', expectedResult: 'entryCount=0, roas=null', actualResult: 'Vitest: PASS against real inserted DB row', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Real SQL aggregation computes ROAS/CPA correctly for one metric entry', expectedResult: 'roas=revenue/spend, cpa=spend/conversions', actualResult: 'Vitest: PASS, 40/200=0.2 and 200/2=100 confirmed exactly', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Real SQL SUM aggregates multiple metric entries for one campaign', expectedResult: 'Correct totals across 2 rows', actualResult: 'Vitest: PASS, 1000 impressions/200 revenue/100 spend/roas=2.0 all summed correctly', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Unauthenticated GET /api/admin/ads-management rejected', expectedResult: '401', actualResult: 'Live curl (no cookie): 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Log metrics entry via real API, real DB write', expectedResult: '201 + row present', actualResult: 'Live curl POST /metrics/: 201, row confirmed via subsequent aggregation call', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'pipeline', caseName: 'POST /budget-optimization/ returns real ranked suggestions', expectedResult: 'Real ROAS-ranked suggestion for the test campaign', actualResult: 'Live curl: HTTP 200, ROAS 4.50 correctly computed from real logged metrics (900 revenue / 200 spend)', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'agentic', caseName: 'POST /budget-optimization/agentic/ produces grounded narrative, real Ollama call', expectedResult: 'Narrative references only real campaign/ROAS data', actualResult: '370 tokens used across plan/act steps, narrative correctly referenced "__e2e_test_campaign" and ROAS 4.50, no invented campaigns', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Customer self-service: unauthenticated GET on valid share token returns report', expectedResult: '200, real report JSON, no admin session used', actualResult: 'Live curl (no cookie): HTTP 200, correct scoredCampaigns/suggestions payload', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Customer self-service: public HTML page renders for valid token', expectedResult: '200', actualResult: 'Live curl GET /report/:token/: HTTP 200', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Customer self-service: bogus token rejected (negative)', expectedResult: '404', actualResult: 'Live curl GET /api/public/report/not-a-real-token/: HTTP 404 {"error":"Report not found"}', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Customer self-service: revoked token rejected (negative)', expectedResult: '410', actualResult: 'Live curl after UPDATE report_share_tokens SET revoked=1: HTTP 410 {"error":"This link has been revoked."}', status: 'pass' },
  { moduleKey: 'ads_management', executionMode: 'manual', caseName: 'Test-data hygiene: campaign + metrics cascade-deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'DELETE campaign via real API -> 200; subsequent GET -> 404; ad_campaign_metrics FK cascade confirmed (public report showed scoredCampaigns:0 after delete, before token revocation)', status: 'pass' },
];

function record() {
  console.log('--- Recording Ad Budget Optimization use-case test results ---');
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
