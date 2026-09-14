/**
 * Records the real verification performed for the Voice AI Lead
 * Qualification use case (Use-Case Build Standard, item 10 of 15) into
 * the persisted test_execution table. Every value here is copied from
 * real test runs already performed this session -- Vitest run + live
 * curl against a running dev server on port 3020, including a real
 * local Ollama call -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase10-voice-ai-qualification-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'detectCallSignals: zero signals in idle chit-chat (negative case)', expectedResult: 'score=0, tier=cold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'detectCallSignals: all 5 BANT+next-step signals in a fully qualified call (positive case)', expectedResult: 'score=100, tier=hot', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'detectCallSignals: warm/hot tier boundaries exact (1 signal=20/warm, 4 signals=80/hot) (boundary)', expectedResult: '20/warm, 80/hot', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'detectCallSignals: casual "decide" does not false-positive the authority signal (boundary)', expectedResult: 'authority_confirmed=false', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'pipeline', caseName: 'Real DB: cold call writes score/tier without linking a contact (negative case)', expectedResult: 'tier=cold, contactId=null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'pipeline', caseName: 'Real DB: hot call with a real email in the transcript creates and links a real contact, source=voice_call (positive case)', expectedResult: 'tier=hot, contactId set, contact.source=voice_call', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: unauthenticated call create rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: log a real cold call transcript', expectedResult: '201', actualResult: 'Live curl: 201 Created', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: log a real hot call transcript with a real email', expectedResult: '201', actualResult: 'Live curl: 201 Created', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'pipeline', caseName: 'Live: qualification pipeline scores the real cold call exactly', expectedResult: 'score=0, tier=cold, no contact', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'pipeline', caseName: 'Live: qualification pipeline scores the real hot call exactly (budget+need+timeline+next-step, no authority phrase)', expectedResult: 'score=80, tier=hot', actualResult: 'Live curl: exact match, hand-verified 4x20=80', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'pipeline', caseName: 'Live: hot call auto-creates a real contact from the real typed email', expectedResult: 'contactCreated=true, contact.source=voice_call', actualResult: 'Live curl: confirmed, contact row created with the real matched email', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'agentic', caseName: 'Live: call-summary agent grounds its recap in the real transcript, no fabrication (real Ollama call, retried once after a transient 60s+ timeout)', expectedResult: 'fabricationWarning=false, recap cites real phrases/email, correctly notes no budget figure was discussed', actualResult: 'Live curl: fabricationWarning=false, summary correctly grounded and hedged where the transcript lacked specifics', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: dashboard KPIs reflect real call qualification coverage', expectedResult: 'totalCalls=2, qualifiedCalls=2, hotCalls=1, contactsLinkedFromCalls=1', actualResult: 'Live curl: exact match', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: report includes per-call qualification tier/score/contact-linked', expectedResult: 'both calls show correct score/tier/contactLinked', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: customer self-service report is aggregate-only, no transcript/phone-number leakage', expectedResult: '200, counts only', actualResult: 'Live curl (no cookie): confirmed, only totals/tier counts returned', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'voice_ai', executionMode: 'manual', caseName: 'Test-data hygiene: 2 call logs + 1 contact + 1 share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across voice_call_logs/contacts/report_share_tokens', status: 'pass' },
];

function record() {
  console.log('--- Recording Voice AI Lead Qualification use-case test results ---');
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
