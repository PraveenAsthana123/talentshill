import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real case_study table gated from publishing without a real evidence_record citation -- enforced at TWO layers: app-level (canPublish/publishCaseStudy) AND a real SQLite foreign-key constraint (discovered live: a fabricated evidenceId is rejected at creation time, before the app check even runs). Directly addresses fabrication-guard.ts\'s documented incident of the local LLM once inventing a fake case study. Live-verified: publish correctly blocked without evidence, succeeded with a real evidence_record id, fabricated id rejected by the real FK constraint.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_case-study-engine-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'case_study_engine')).run();
console.log('Updated case_study_engine -> real');
