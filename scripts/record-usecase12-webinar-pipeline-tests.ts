/**
 * Records the real verification performed for the AI Webinar-to-Pipeline
 * Engine use case (Use-Case Build Standard, item 12 of 15) into the
 * persisted test_execution table. Every value here is copied from real
 * test runs already performed this session -- Vitest run + live curl
 * against a running dev server on port 3022, including a real local
 * Ollama call -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase12-webinar-pipeline-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'computeAttendeeQualificationScore: no-show scores 0 regardless of notes (negative case)', expectedResult: 'score=0, tier=cold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'computeAttendeeQualificationScore: attendee with no notes scores the 50-point base (boundary)', expectedResult: 'score=50, tier=warm', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'computeAttendeeQualificationScore: fully engaged attendee scores the max 100 (positive case)', expectedResult: 'score=100, tier=hot, all signals detected', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'computeAttendeeQualificationScore: score never exceeds 100 (boundary)', expectedResult: 'score<=100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'computeAttendeeQualificationScore: attended=null treated as not attended (negative case)', expectedResult: 'score=0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'pipeline', caseName: 'Real DB: cold no-show registrant never pushed into the leads pipeline (negative case)', expectedResult: 'qualifiedCount=0, no contact_submissions row created', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'pipeline', caseName: 'Real DB: qualifying attendee creates a real leads-pipeline row (positive case)', expectedResult: 'qualificationStage=sql, company carried over', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'pipeline', caseName: 'Real DB: pipeline re-run never demotes a manually-promoted lead (regression guard, positive case)', expectedResult: 'stage stays "customer" after re-run', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: unauthenticated webinar create rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: create real webinar + 3 real registrants (hot/no-show/warm)', expectedResult: '201 x4', actualResult: 'Live curl: all created', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: record real attendance/engagement for all 3 registrants', expectedResult: '200 x3', actualResult: 'Live curl: all recorded', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'pipeline', caseName: 'Live: conversion pipeline scores the real 3-registrant scenario exactly', expectedResult: 'registrantCount=3, attendedCount=2, qualifiedCount=2, no-show excluded', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'pipeline', caseName: 'Live: warm/hot registrants correctly create real mql/sql leads-pipeline rows', expectedResult: 'warm->mql, hot->sql, company/email carried over', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'agentic', caseName: 'Live: post-webinar recap agent cites only real numbers (real Ollama call)', expectedResult: 'fabricationWarning=false, cites 3 registered/2 attended/2 qualified', actualResult: 'Live curl: fabricationWarning=false, exact real numbers cited', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: dashboard KPIs reflect real webinar conversion coverage', expectedResult: 'totalRegistrants=3, attendedCount=2, qualifiedFromWebinars=2, pipelineLinkedCount=2', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: report includes real webinar row with correct counts', expectedResult: 'registrantCount=3, attendedCount=2, qualifiedCount=2', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: customer self-service report is aggregate-only, no registrant PII/notes leakage', expectedResult: '200, counts only', actualResult: 'Live curl (no cookie): confirmed, only totals/tier counts returned', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'appointments', executionMode: 'manual', caseName: 'Test-data hygiene: 1 webinar + 3 registrants + 2 leads + 1 share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across webinars/webinar_registrants/contact_submissions/report_share_tokens', status: 'pass' },
];

function record() {
  console.log('--- Recording AI Webinar-to-Pipeline Engine use-case test results ---');
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
