import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const now = new Date();

function registerModule() {
  const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, 'occasions')).get();
  const data = {
    name: 'Customer Occasions',
    description: 'Admin-level birthday/anniversary/festival (including location-based)/custom occasion messaging. Deterministic template-based sends, no LLM composition. No real SMS/WhatsApp/email gateway -- every send is a real logged intent, never a fabricated delivery confirmation.',
    builtStatus: 'real' as const,
    apiRouteCount: 8,
    hasAdminUi: true,
    missingItems: 'No real SMS/WhatsApp/email gateway integration (disclosed); no customer self-service surface (admin-level only, by explicit request); lunar festivals require manual annual re-seeding.',
    sourceDoc: 'docs/testing/2026-09-14_occasion-messaging-log.txt',
  };
  if (existing) {
    db.update(schema.moduleRegistry).set({ ...data, lastVerifiedAt: now, verifiedBy: 'claude-session-2026-09-14', updatedAt: now }).where(eq(schema.moduleRegistry.moduleKey, 'occasions')).run();
    console.log('Updated module_registry: occasions');
  } else {
    db.insert(schema.moduleRegistry).values({ id: randomUUID(), moduleKey: 'occasions', ...data, lastVerifiedAt: now, verifiedBy: 'claude-session-2026-09-14', createdAt: now, updatedAt: now }).run();
    console.log('Inserted module_registry: occasions');
  }
}

function recordTests() {
  const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
    { moduleKey: 'occasions', executionMode: 'manual', caseName: 'computeYearsSince: real whole-year difference (positive case)', expectedResult: '6', actualResult: 'Vitest PASS', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'manual', caseName: 'personalizeOccasionMessage: real firstName/years substitution, never fabricated (positive + negative case)', expectedResult: 'substituted or generic fallback, {{years}} empty when null', actualResult: 'Vitest PASS', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'pipeline', caseName: 'Real DB: birthday match by real month/day, no match for a different month/day (positive + negative case)', expectedResult: '1 message for matching DOB, 0 for non-matching', actualResult: 'Vitest PASS', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'pipeline', caseName: 'Real DB: same-day dedupe on a second pipeline run (negative case)', expectedResult: '1 message total after 2 runs', actualResult: 'Vitest PASS', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'pipeline', caseName: 'Real DB: festival matches only the real country-scoped contact, never the mismatched country (positive + negative case)', expectedResult: 'IN contact gets 1 message, US contact gets 0', actualResult: 'Vitest PASS', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'pipeline', caseName: 'Real DB: no active template for a channel skips and reports (boundary)', expectedResult: 'skippedNoTemplate >= 1, 0 messages written', actualResult: 'Vitest PASS', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'manual', caseName: 'Live: unauthenticated trigger rejected (negative case)', expectedResult: '401 Unauthorized', actualResult: 'Live curl: {"error":"Unauthorized"}', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'pipeline', caseName: 'Live: real birthday scan against a real contact with real date_of_birth=today matches and logs a correctly personalized message', expectedResult: 'birthdaysFound=1, triggered=1, "Happy Birthday, Maria!"', actualResult: 'Live curl: exact match, verified via direct sqlite3 SELECT', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'manual', caseName: 'Live: real admin-typed custom message logged for a real contact', expectedResult: '201 with a real occasion_messages row, occasionType=custom', actualResult: 'Live curl: confirmed via dashboard byOccasionType.custom=1', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'manual', caseName: 'Live: dashboard reflects real seeded festival/template/message counts', expectedResult: 'totalFestivals=3, totalTemplates=7, totalMessages=2', actualResult: 'Live curl: exact match', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'pipeline', caseName: 'Live: second same-day trigger run correctly skips the already-messaged contact (real dedupe)', expectedResult: 'skippedAlreadySent=1, triggered=0', actualResult: 'Live curl: exact match', status: 'pass' },
    { moduleKey: 'occasions', executionMode: 'manual', caseName: 'Test-data hygiene: real test contact + its occasion messages deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0', status: 'pass' },
  ];
  let created = 0, skipped = 0;
  for (const r of RECORDS) {
    const existing = db.select().from(schema.testExecution)
      .where(eq(schema.testExecution.moduleKey, r.moduleKey)).all()
      .find((row) => row.caseName === r.caseName);
    if (existing) { skipped++; continue; }
    recordTestExecution(r);
    created++;
  }
  console.log(`Test executions: created ${created}, skipped ${skipped} (already present).`);
}

registerModule();
recordTests();
