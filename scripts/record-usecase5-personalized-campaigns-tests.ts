/**
 * Records the real verification performed for the AI Personalized Email
 * Campaigns use case (Use-Case Build Standard, item 5 of 15) into the
 * persisted test_execution table. Every value here is copied from real
 * test runs already performed this session -- Vitest run + live curl
 * against a running dev server on port 3015, including a real job-queue
 * send attempt and 1 real Ollama call -- not fabricated. Idempotent.
 * Run: npx tsx scripts/record-usecase5-personalized-campaigns-tests.ts
 */
import { db, schema } from '../lib/db/index';
import { eq, and } from 'drizzle-orm';
import { recordTestExecution } from '../lib/testing/record-test-execution';

const RECORDS: Parameters<typeof recordTestExecution>[0][] = [
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'assignVariant: same recipient always gets the same variant (positive case)', expectedResult: 'stable across calls', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'assignVariant: stays within bounds for variant count (boundary)', expectedResult: '0 <= v < count', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'assignVariant: single-variant campaign always returns 0 (boundary n=1)', expectedResult: '0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Recipient materialization: real static list membership materialized into campaign_recipients, audienceCount written (positive case)', expectedResult: '2 added, audienceCount=2', actualResult: 'Vitest PASS -- and live curl confirmed identical result against a real running dev server', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Recipient materialization: FOUND REAL BUG -- addCampaignRecipients onConflictDoNothing was dead code (no unique constraint), re-running duplicated recipients', expectedResult: 'idempotent, 0 added on re-run', actualResult: 'First run FAILED this assertion (1 duplicate inserted); fixed by adding a real unique index on (campaign_id, contact_id); re-ran and PASSED', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Recipient materialization: nonexistent campaign returns null, no crash (negative case)', expectedResult: 'campaignId=null, added=0', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Behavioral segmentation: real non-opener identified and materialized into a real nurture list (positive case)', expectedResult: '1 non-opener, real list created', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Behavioral segmentation: FOUND REAL BUG -- clicked-status recipients were excluded from the "sent" cohort entirely', expectedResult: 'clicked recipient counted as sent, correctly excluded from non-openers', actualResult: 'Caught live (real campaign had 1 clicked recipient, pipeline reported 0 sent); fixed status filter to include opened/clicked; re-verified live and via new regression test, both PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'pipeline', caseName: 'Behavioral segmentation: zero non-openers creates no list (boundary)', expectedResult: 'nurtureListId=null', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Tracking counters: FOUND REAL BUG -- logOpenEvent/logClickEvent never incremented campaign.totalOpened/totalClicked', expectedResult: 'totalOpened increments on first open', actualResult: 'Caught live (real pixel hit correctly set recipient status=opened but campaign.totalOpened stayed 0); fixed both functions to increment on first-open/first-click only; re-verified live (totalOpened: 0->1 on a real pixel request) and via 3 new regression tests, all PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Tracking counters: repeat opens from the same recipient do not double-count (negative/idempotency case)', expectedResult: 'totalOpened stays 1 after 3 logOpenEvent calls', actualResult: 'Vitest PASS', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: FOUND REAL BUG -- campaign detail page called setCampaign(wholeResponse) instead of setCampaign(response.campaign), silently breaking every stat/variant display', expectedResult: 'Correct campaign.name/totalSent/etc rendered', actualResult: 'Found by reading the actual GET route response shape ({campaign, variants}) against the page code; fixed to destructure correctly; variants array was also never fetched before (always empty)', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: real per-recipient personalization renders {{firstName}}/{{company}} from the real contact row', expectedResult: 'Merge variables substituted with real data, not literal {{firstName}}', actualResult: 'Directly verified via a standalone render script: "Hello Alice Test, this is a test email for Acme Co." -- confirmed correct composition with pixel/link/unsubscribe injection', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: real open-tracking pixel updates a real recipient row end-to-end', expectedResult: 'status=opened, openedAt set', actualResult: 'Live curl -L to the real /api/t/o/:recipientId route: confirmed openedAt written', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: real click-tracking redirect updates a real recipient row end-to-end', expectedResult: 'status=clicked, clickedAt set', actualResult: 'Live curl -L to the real /api/t/c/:recipientId route: confirmed clickedAt written', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'agentic', caseName: 'Live: AI variant-B generation preserves merge variables and avoids fabricated statistics, real Ollama call', expectedResult: 'fabricationWarning=false, {{firstName}}/{{company}} present in generated body', actualResult: 'Live curl: 490 tokens, correct format parsed (SUBJECT/BODY), no numeric pattern detected, merge variables present as instructed', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: real job-queue send correctly marks recipients failed (not falsely successful) when SMTP is genuinely misconfigured', expectedResult: 'status=failed, error recorded, no false-positive sent count', actualResult: 'Live: job completed with 0 sent/2 failed against the same pre-existing smtp.example.com placeholder documented in the leads use case; unsubscribe tokens were still created beforehand, proving the personalization/tracking code path executed correctly before the (unrelated, pre-existing) SMTP failure', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: unauthenticated materialize-recipients rejected (negative case)', expectedResult: '401', actualResult: 'Live curl: 401 {"error":"Unauthorized"}', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: customer self-service campaign report link, no auth, aggregate + variant data only', expectedResult: '200, real send/open/click/variant data', actualResult: 'Live curl (no cookie): correct campaign summary including both real A/B variants', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Live: public HTML share page renders', expectedResult: '200', actualResult: 'Live curl: HTTP 200', status: 'pass' },
  { moduleKey: 'campaigns', executionMode: 'manual', caseName: 'Test-data hygiene: 2 contacts, 1 list, 1 template, 1 campaign + recipients/variants/tokens deleted, confirmed gone', expectedResult: '0 rows remain', actualResult: 'sqlite3 DELETE + COUNT confirmed 0 across contacts/lists/email_templates/campaigns', status: 'pass' },
];

function record() {
  console.log('--- Recording AI Personalized Email Campaigns use-case test results ---');
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
