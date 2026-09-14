/**
 * Records the real verification performed for the AI Content Factory use
 * case (Use-Case Build Standard, item 4 of 15) into the persisted
 * test_execution table. Every value here is copied from real test runs
 * already performed this session -- Vitest run + live curl against a
 * running dev server on port 3014, including 3 real Ollama calls
 * (2 generation, 1 performance narrative) -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase4-content-factory-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'content', executionMode: 'manual', caseName: 'classifyContentAction: produce_more for top-ranked content (positive case)', expectedResult: 'action=produce_more', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'classifyContentAction: deprioritize for bottom-half content (negative case)', expectedResult: 'action=deprioritize', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'classifyContentAction: single high-performer produces_more, not hold (boundary n=1)', expectedResult: 'action=produce_more', actualResult: 'Vitest PASS, reused the n=1-safe rule from prior use cases', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'classifyContentAction: null conversionRate holds (boundary)', expectedResult: 'action=hold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Real SQL aggregation excludes zero-engagement content (boundary)', expectedResult: 'entryCount=0, conversionRate=null', actualResult: 'Vitest PASS against real inserted row', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Real SQL aggregation computes conversion rate (positive case)', expectedResult: '25/1000=0.025', actualResult: 'Vitest PASS, exact match', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'containsSuspiciousStatistics flags a fabricated percentage (regression)', expectedResult: 'true', actualResult: 'Vitest PASS -- backstop for a real bug caught live: phi4-mini fabricated "15% increase" and a fake TalentsHill customer result despite explicit instructions not to', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'containsSuspiciousStatistics flags a fabricated dollar figure', expectedResult: 'true', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'containsSuspiciousStatistics does not false-positive on qualitative text (negative case)', expectedResult: 'false', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Live: unauthenticated GET rejected', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Live: topic with scheduledDate auto-sets status=scheduled', expectedResult: 'status=scheduled', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'content', executionMode: 'agentic', caseName: 'Live: content generation agent produces a real Ollama draft grounded in real persona/topic', expectedResult: 'Draft created, status=draft, references the real persona', actualResult: 'Live curl: 1031 tokens, draft correctly referenced the CFO persona/tone; BUT model fabricated specific percentages/named-customer claims despite explicit instruction not to -- documented as a real, disclosed model-compliance limitation, not hidden', status: 'pass' },
  { moduleKey: 'content', executionMode: 'agentic', caseName: 'Live: fabrication-warning backstop fires on a violating draft, banner prepended to body', expectedResult: 'fabricationWarning=true, warning banner in body', actualResult: 'Confirmed on the first generation run (contained "15%", "20%", "18%", "10%")', status: 'pass' },
  { moduleKey: 'content', executionMode: 'agentic', caseName: 'Live: second generation with no violation returns fabricationWarning=false correctly (negative case)', expectedResult: 'fabricationWarning=false, no banner', actualResult: 'Confirmed on second generation run, qualitative content with no number patterns', status: 'pass' },
  { moduleKey: 'content', executionMode: 'pipeline', caseName: 'Live: performance pipeline correctly ranks a high-performing (5% conversion) and low-performing (0.1% conversion) content item', expectedResult: 'high=produce_more, low=deprioritize', actualResult: 'Live curl: exactly as expected, math independently verified 100/2000=0.05 and 2/2000=0.001', status: 'pass' },
  { moduleKey: 'content', executionMode: 'agentic', caseName: 'Live: performance narrative agent references only real content titles/numbers, real Ollama call', expectedResult: 'No invented content items', actualResult: 'Live curl: narrative correctly cited both real topics with correct lead/view figures and correct action recommendations', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Live: customer self-service report link, no auth', expectedResult: '200, real suggestions', actualResult: 'Live curl (no cookie): scoredContent=2', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'content', executionMode: 'manual', caseName: 'Test-data hygiene: 1 persona + 2 topics + 2 content items + engagement + share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across all 3 tables', status: 'pass' },
];

function record() {
  console.log('--- Recording AI Content Factory use-case test results ---');
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
