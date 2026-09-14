/**
 * Records the real verification performed for the Market Research
 * Opportunity Scoring use case (Use-Case Build Standard, item 8 of 15)
 * into the persisted test_execution table. Every value here is copied
 * from real test runs already performed this session -- Vitest run +
 * live curl against a running dev server on port 3018, including a
 * real local Ollama call -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase8-opportunity-scoring-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'computeOpportunityScore: max 100 for large SOM/low competition/low risk/perfect fit (positive case)', expectedResult: '100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'computeOpportunityScore: min 0 for zero SOM/high competition/high risk/zero fit (negative case)', expectedResult: '0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'computeOpportunityScore: SOM tier boundaries exact ($9,999/$10,000/$99,999/$100,000/$999,999/$1,000,000) (boundary)', expectedResult: '0/10/10/25/25/40', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'computeOpportunityScore: strategic-fit input >100 clamped, not out-of-range (boundary)', expectedResult: 'contribution=15 (clamped to 100)', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'rankByScore: tied scores share the same dense rank (boundary)', expectedResult: 'ranks 1,1,3,4', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'rankByScore: single item ranks #1 (positive case)', expectedResult: 'rank=1', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'rankByScore: empty list does not throw (negative case)', expectedResult: '[]', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'pipeline', caseName: 'Real DB: brief missing opportunity-scoring inputs correctly skipped (negative case)', expectedResult: 'not present in ranked output', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'pipeline', caseName: 'Real DB: brief with complete real inputs scored+ranked and written back to the row (positive case)', expectedResult: 'opportunityScore=100, opportunityRank=1', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: unauthenticated brief create rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: create 3 real briefs (2 to be scored, 1 deliberately left incomplete)', expectedResult: '3x 201', actualResult: 'Live curl: all 3 created', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: PATCH real opportunity-scoring inputs (SOM/competition/risk/strategic-fit) onto 2 briefs', expectedResult: '2x 200', actualResult: 'Live curl: both succeeded', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'pipeline', caseName: 'Live: opportunity scoring pipeline computes exact composite scores from real inputs', expectedResult: 'brief A=82/100 (rank 1), brief B=72/100 (rank 2), 1 skipped', actualResult: 'Live curl: exact match, math independently verified (40+15+15+12=82; 25+30+8+9=72)', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'agentic', caseName: 'Live: opportunity recommendation agent references only real ranked titles/scores, real Ollama call', expectedResult: 'No invented market sizes/competitors, fabricationWarning=false', actualResult: 'Live curl: narrative correctly cited "82/100" and "72/100" with real titles, fabricationWarning=false', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: dashboard KPIs reflect real opportunity-scoring coverage', expectedResult: 'opportunityScoredCount=2, avgOpportunityScore=77, topOpportunity=brief A rank 1', actualResult: 'Live curl: exact match, avg independently verified (82+72)/2=77', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: report includes real cross-brief opportunity ranking', expectedResult: '2 ranked entries with real SOM/competition/risk/fit values', actualResult: 'Live curl: confirmed, values match what was entered', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: customer self-service opportunity-ranking report, no auth, real ranked data', expectedResult: '200, real ranking', actualResult: 'Live curl (no cookie): 2 real ranked briefs returned with correct scores', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'market_research', executionMode: 'manual', caseName: 'Test-data hygiene: 3 briefs + 1 share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across market_research_briefs/report_share_tokens', status: 'pass' },
];

function record() {
  console.log('--- Recording Market Research Opportunity Scoring use-case test results ---');
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
