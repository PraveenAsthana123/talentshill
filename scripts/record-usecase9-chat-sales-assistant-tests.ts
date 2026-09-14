/**
 * Records the real verification performed for the AI Conversational
 * Sales Assistant use case (Use-Case Build Standard, item 9 of 15)
 * into the persisted test_execution table. Every value here is copied
 * from real test runs already performed this session -- Vitest run +
 * live curl against a running dev server on port 3019, including a
 * real local Ollama call -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase9-chat-sales-assistant-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'detectBuyingSignals: zero signals in a plain greeting (negative case)', expectedResult: 'score=0, tier=cold', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'detectBuyingSignals: all 5 signals in a fully qualified message (positive case)', expectedResult: 'score=100, tier=hot', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'detectBuyingSignals: warm/hot tier boundaries exact (1 signal=20/warm, 4 signals=80/hot) (boundary)', expectedResult: '20/warm, 80/hot', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'detectBuyingSignals: real session-captured email counted as contact_shared without re-scanning text (boundary)', expectedResult: 'contact_shared detected, matchedText=session email', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'detectBuyingSignals: assistant-authored messages excluded from visitor signal scan (negative case)', expectedResult: 'score=0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'pipeline', caseName: 'Real DB: cold conversation writes score/tier without linking a contact (negative case)', expectedResult: 'tier=cold, contactId=null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'pipeline', caseName: 'Real DB: hot conversation with a real visitor email creates and links a real contact, source=chat (positive case)', expectedResult: 'tier=hot, contactId set, contact.source=chat', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: unauthenticated qualify rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: real visitor sends a qualifying message via the public /api/chat endpoint', expectedResult: '200, session+request auto-created', actualResult: 'Live curl: 200, real chat_session and chat_request created', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'pipeline', caseName: 'Live: qualification pipeline scores the real message exactly (pricing+demo+timeline+contact_shared, no buy keyword)', expectedResult: 'score=80, tier=hot', actualResult: 'Live curl: exact match, hand-verified 4 of 5 signals x20', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'pipeline', caseName: 'Live: hot conversation auto-creates a real contact from the real typed email (gap-closing fallback since session.visitorEmail is never populated by any existing code path)', expectedResult: 'contactCreated=true, contact.source=chat', actualResult: 'Live curl: confirmed, contact row created with the real matched email', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'agentic', caseName: 'Live: draft-reply agent grounds its reply in the real conversation, no fabricated pricing (real Ollama call)', expectedResult: 'fabricationWarning=false, no invented figures', actualResult: 'Live curl: fabricationWarning=false, draft correctly declined to quote a specific price', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: request-detail conversation transcript endpoint returns real messages (previously the detail page showed none)', expectedResult: '2 real messages', actualResult: 'Live curl: confirmed, user + assistant messages returned', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: dashboard KPIs reflect real qualification coverage', expectedResult: 'qualifiedRequests, hotRequests, contactsLinkedFromChat all real counts', actualResult: 'Live curl: confirmed real counts matching DB state', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: report includes per-request qualification tier/score/contact-linked', expectedResult: 'hot entries show correct score/tier/contactLinked=true', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: customer self-service report is aggregate-only, no PII', expectedResult: '200, counts only, no visitor emails/content', actualResult: 'Live curl (no cookie): confirmed, only totals/tier counts returned', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'chat', executionMode: 'manual', caseName: 'Test-data hygiene: 3 sessions/requests/messages + 2 contacts + 1 share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across chat_sessions/contacts/report_share_tokens', status: 'pass' },
];

function record() {
  console.log('--- Recording AI Conversational Sales Assistant use-case test results ---');
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
