/**
 * Records the real verification performed for the Lifecycle/Activation
 * Journey Tracking use case (Use-Case Build Standard, item 6 of 15)
 * into the persisted test_execution table. Every value here is copied
 * from real test runs already performed this session -- Vitest run +
 * live curl against a running dev server on port 3016, including a real
 * tracking-pixel/click flow and a real Ollama call -- not fabricated.
 * Idempotent. Run: npx tsx scripts/record-usecase6-lifecycle-activation-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: unsubscribed always classifies churned regardless of engagement (positive case)', expectedResult: 'churned', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: zero sends classifies new (boundary)', expectedResult: 'new', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: recently-created never-opened contact is new, not at_risk (boundary)', expectedResult: 'new', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: old never-opened contact is at_risk (negative case)', expectedResult: 'at_risk', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: recently-engaged contact is engaged (positive case)', expectedResult: 'engaged', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: 45 days since engagement is at_risk (boundary)', expectedResult: 'at_risk', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'classifyLifecycleStage: 120 days since engagement is churned (boundary)', expectedResult: 'churned', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'computeActivationScore: zero sends scores 0 (boundary)', expectedResult: '0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'computeActivationScore: full engagement + fresh recency scores near-max (positive case)', expectedResult: '>=95', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'computeActivationScore: never exceeds 100 even with capped-input rates (boundary)', expectedResult: '<=100', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'computeActivationScore: sent-but-never-engaged scores 0 (negative case)', expectedResult: '0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'pipeline', caseName: 'Real DB: activation pipeline writes lifecycle_stage/activation_score/last_engaged_at from real campaign_recipients (positive case)', expectedResult: 'engaged, score>0, lastEngagedAt set', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'pipeline', caseName: 'Real DB: retention segmentation materializes real at_risk contacts into a real list (positive case)', expectedResult: 'real list with the at-risk contact as a member', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'Live: unauthenticated activation-scoring rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'Live: FOUND REAL BUG -- contact create API silently dropped the status field', expectedResult: 'status=unsubscribed persisted as sent', actualResult: 'First creation: status stayed "active" despite {"status":"unsubscribed"} in the request body (route never destructured it). Fixed by adding status to the destructure + createContact call. Re-verified: status correctly persisted.', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'pipeline', caseName: 'Live: activation scoring correctly classifies 3 real distinct lifecycle profiles in one run', expectedResult: 'new (0 sends), engaged (real open+click via real tracking routes), churned (unsubscribed)', actualResult: 'Live curl: new/new/engaged/churned counts and per-contact scores all exactly as expected after the status-field fix; engaged contact scored 100 (full engagement rate + same-day recency)', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'pipeline', caseName: 'Live: retention segmentation creates a real list from a real at_risk contact', expectedResult: '1 at-risk, real list created', actualResult: 'Live curl: confirmed', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'agentic', caseName: 'Live: retention narrative agent re-computes fresh state (not stale) and references only real counts, real Ollama call', expectedResult: 'Narrative reflects the true, freshly-recomputed distribution, not a manually-set stale flag', actualResult: 'Live curl: agent internally re-ran the activation pipeline, correctly reporting the true recomputed state (0 at-risk after a manually-set at_risk flag was overwritten by real recompute) -- correct behavior, not a bug: narrative should reflect ground truth, not stale manual edits', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'Live: customer self-service lifecycle summary, no PII, aggregate stage counts only', expectedResult: '200, no email addresses present', actualResult: 'Live curl (no cookie) + grep check: PASS, only stage/count breakdown present', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'contacts', executionMode: 'manual', caseName: 'Test-data hygiene: 4 contacts + 1 campaign + 2 lists + events + share token deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across contacts/campaigns/lists', status: 'pass' },
];

function record() {
  console.log('--- Recording Lifecycle/Activation Journey Tracking use-case test results ---');
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
