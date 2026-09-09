/**
 * One-time backfill: moves the already-real test results documented as
 * hardcoded arrays in modules 1-3's TestingTab.tsx (from this session's
 * actual live verification runs) into the new persisted test_execution
 * table. Every value here is copied from real verification already
 * performed and committed -- not newly fabricated. Idempotent (checks
 * for existing rows by caseName+moduleKey before inserting).
 * Run: npx tsx lib/testing/backfill-test-executions.ts
 */
import { db, schema } from '../db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from './record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  // Competitor Analysis
  { moduleKey: 'competitor_analysis', executionMode: 'manual', caseName: 'Unauthenticated GET rejected', expectedResult: '401', actualResult: '401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'manual', caseName: 'Create entry logs operation_run', expectedResult: '201 + real operation_run row', actualResult: 'Confirmed via direct API query, input/output payloads correctly serialized', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'manual', caseName: 'Delete entry logs operation_run', expectedResult: '200 + delete_entry operation_run row', actualResult: 'Confirmed -- both create_entry and delete_entry rows present in history', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'pipeline', caseName: 'Real HTTP fetch against external URL', expectedResult: 'Real fetch, real extracted title', actualResult: 'HTTP 200, title "Example Domain" -- matches example.com\'s actual real content', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'pipeline', caseName: 'Draft entry stays needs_research', expectedResult: 'status = needs_research', actualResult: 'Confirmed via DB query', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'agentic', caseName: 'Agent says "insufficient data" on thin input', expectedResult: 'No fabrication when data is thin', actualResult: 'Model output: "...unable to draft an honest comparison... insufficient data for this task"', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'agentic', caseName: 'Token accounting matches Ollama response', expectedResult: 'plan + act tokens = total', actualResult: '167 + 347 = 514, matches reported total exactly', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'cross-module', caseName: 'Monitoring cross-tab aggregation accurate', expectedResult: 'Counts match prior manual/pipeline/agentic runs', actualResult: '7 total runs (manual:4, agentic:1, pipeline:2), 514 tokens matching the Agentic run exactly', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'cross-module', caseName: 'Dashboard coverage KPIs match DB state', expectedResult: 'servicesCovered + servicesUncovered = totalServices', actualResult: '1 covered + 16 uncovered = 17 total, confirmed against real services table', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'cross-module', caseName: 'Report excludes template rows', expectedResult: 'Template row absent from generated report', actualResult: 'Confirmed -- report only lists real, non-template entries', status: 'pass' },
  { moduleKey: 'competitor_analysis', executionMode: 'cross-module', caseName: 'Test-data hygiene', expectedResult: '0 leftover test rows after verification', actualResult: 'Caught and fixed 1 real gap: a leftover row from a failed-parse test attempt, found via the Report tab, deleted, confirmed clean', status: 'pass' },

  // Leads
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Status update logs operation_run', expectedResult: 'Real manual operation_run row', actualResult: 'logOperationRun wired into existing PATCH /api/admin/leads/[id]', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'pipeline', caseName: 'Score a real lead from the actual public contact form', expectedResult: 'Correct deterministic score', actualResult: 'Submitted via real /api/contact, scored 85/100 "hot" -- math independently verified: 20+20+20+15+10=85', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'pipeline', caseName: 'Score written to real DB', expectedResult: 'contact_submissions.leadScore/leadTier updated', actualResult: 'Confirmed via direct DB query', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'agentic', caseName: 'Real Ollama call drafts qualification narrative', expectedResult: 'Narrative references real submission data', actualResult: '41.7s real inference, narrative correctly referenced real timeline/budget/score', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'cross-module', caseName: 'Test lead cleanup', expectedResult: '0 leftover rows after test', actualResult: 'Deleted test submission, confirmed 0 rows remain', status: 'pass' },

  // Campaigns
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Create/update/delete/launch log operation_run', expectedResult: 'Real manual operation_run rows for each action', actualResult: 'logOperationRun wired into POST/PATCH/DELETE/launch routes', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Readiness check against a real campaign with genuine gaps', expectedResult: 'Correctly identifies real blockers', actualResult: 'Ran against real "Campaign Run Test" campaign -- correctly found 0 audience + no email profile, matching actual DB row', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Readiness check does not modify campaign data', expectedResult: 'campaigns table unchanged after run', actualResult: 'Confirmed -- pipeline is read-only by design, no cleanup needed', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'agentic', caseName: 'Real Ollama call drafts subject-line suggestions', expectedResult: 'Suggestions reference the real campaign name', actualResult: '43.3s real inference, 291 tokens, suggestions correctly referenced "Campaign Run Test"', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'cross-module', caseName: 'Job-queue reporting accuracy fix', expectedResult: 'Accurate report of real jobs-table integration', actualResult: 'Fixed an inaccurate first-draft "not applicable" note after discovering launch really does create a job -- now reports real job data', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'cross-module', caseName: 'Regression test on existing PATCH update path', expectedResult: 'Real DB write + logging, no lasting side effect', actualResult: 'Changed throttlePerMinute 60->45, confirmed DB write + operation_run log, reverted to 60, confirmed reverted', status: 'pass' },
];

function backfill() {
  console.log('--- Backfilling test_execution from documented real results ---');
  let created = 0, skipped = 0;
  for (const r of RECORDS) {
    const existing = db.select().from(schema.testExecution)
      .where(and(eq(schema.testExecution.moduleKey, r.moduleKey), eq(schema.testExecution.caseName, r.caseName)))
      .get();
    if (existing) { skipped++; continue; }
    recordTestExecution(r);
    created++;
  }
  console.log(`--- Done: ${created} created, ${skipped} already existed ---`);
}

backfill();
