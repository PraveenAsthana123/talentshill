/**
 * Records the real verification performed for the Lead Scoring &
 * Qualification use case (Use-Case Build Standard, item 2 of 15) into
 * the persisted test_execution table. Every value here is copied from
 * real test runs already performed this session -- Vitest run + live
 * curl against a running dev server on port 3012 -- not fabricated.
 * Idempotent. Run: npx tsx scripts/record-usecase2-lead-scoring-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Fixed rubric conflict: pipeline now delegates to lib/contact/lead-scoring.ts instead of a second, disagreeing weight table', expectedResult: 'One formula, consistent tier thresholds', actualResult: 'Vitest PASS -- confirmed max-strength lead scores exactly 100/hot via the shared calculateLeadScore', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'calculateLeadScore: weak lead scores near 0, cold tier (negative case)', expectedResult: 'score<25, tier=cold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'calculateLeadScore: unrecognized enum values score 0, no crash (boundary)', expectedResult: 'score=0, tier=cold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'calculateLeadScore: score capped at 100 (boundary)', expectedResult: 'score<=100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'calculateLeadScore: stage breakdown sums to total score', expectedResult: 'sum(stages.points) === score', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'classifyQualificationStage: hot->sql, warm->mql, cool/cold->unqualified', expectedResult: 'Correct mapping', actualResult: 'Vitest PASS (3 cases)', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'shouldSendHotLeadAlert: only hot + never-alerted sends (positive/negative/idempotency)', expectedResult: 'true only for hot+null alertSentAt', actualResult: 'Vitest PASS (3 cases)', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'sendHotLeadAlertIfNeeded: does NOT mark alertSentAt when email send fails', expectedResult: 'alertSentAt untouched, sent=false', actualResult: 'Vitest PASS (mocked sendEmail failure) -- regression test for a real bug caught live: sendEmail swallows errors and returns {success:false} instead of throwing, original code marked alertSentAt unconditionally', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'sendHotLeadAlertIfNeeded: DOES mark alertSentAt when email send succeeds (positive case)', expectedResult: 'alertSentAt set, sent=true', actualResult: 'Vitest PASS (mocked sendEmail success)', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'resolveQualificationStageOnRescore: never regresses a manual promotion', expectedResult: 'opportunity stays opportunity even if re-score computes sql', actualResult: 'Vitest PASS -- regression test for a real bug caught live: pipeline re-run silently demoted an admin-promoted "opportunity" lead back to "sql"', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: hot-tier public contact submission scores correctly and auto-classifies to sql', expectedResult: 'leadScore=91, leadTier=hot, qualificationStage=sql', actualResult: 'Live curl POST /api/contact/: exactly as expected', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: real SMTP failure did NOT mark alertSentAt (SMTP genuinely misconfigured, smtp.example.com placeholder)', expectedResult: 'alertSentAt=null after a real failed send attempt', actualResult: 'Confirmed via GET /api/admin/leads/:id/ -- alertSentAt null, dev log shows real "[EMAIL ERROR] getaddrinfo ENOTFOUND smtp.example.com"', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: unauthenticated GET /api/admin/leads/:id rejected (negative)', expectedResult: '401', actualResult: 'Live curl (no cookie): 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: manual qualification PATCH promotes stage + sets assignedTo', expectedResult: '200, stage=opportunity, assignedTo set', actualResult: 'Live curl PATCH /api/admin/leads/:id/qualification/: confirmed', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: invalid qualification stage rejected (negative)', expectedResult: '400', actualResult: 'Live curl with "not-a-real-stage": 400 with valid-values message', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'pipeline', caseName: 'Live: pipeline re-run after fix holds a manually-promoted stage instead of reverting it', expectedResult: 'opportunity stays opportunity across a real pipeline re-run', actualResult: 'Live curl: confirmed after applying the resolveQualificationStageOnRescore fix (first attempt, pre-fix, correctly reproduced the bug -- reverted to sql; re-promoted and re-tested post-fix -- held at opportunity)', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: leads share-link report is aggregate-only, no PII leaked', expectedResult: 'No fullName/email string present in the public JSON response', actualResult: 'Live curl grep check: PASS, only counts/stage/industry breakdowns present', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Live: public leads share HTML page renders', expectedResult: '200', actualResult: 'Live curl GET /report/leads/:token/: HTTP 200', status: 'pass' },
  { moduleKey: 'leads', executionMode: 'manual', caseName: 'Test-data hygiene: 2 test leads deleted, confirmed gone via direct DB query', expectedResult: '0 rows remain matching __e2e%', actualResult: 'sqlite3 DELETE + COUNT confirmed 0', status: 'pass' },
];

function record() {
  console.log('--- Recording Lead Scoring & Qualification use-case test results ---');
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
