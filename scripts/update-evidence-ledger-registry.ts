import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real FACT/ESTIMATE/INFERENCE/HYPOTHESIS/UNKNOWN claim classification with mandatory source traceability (recordEvidence throws on empty sourceRef). Wired into the real lead-scoring pipeline (one real evidence row per real score computation); also accepts real manual admin entries via POST.',
  apiRouteCount: 2,
  hasAdminUi: true,
  missingItems: 'Only wired into 1 of many pipelines so far (lead-scoring); other pipelines (voice qualification, campaign scoring, etc.) do not yet emit evidence rows -- extend incrementally as those areas are touched. Lean single-page admin UI, not the full Operational Portal 10-tab standard (disclosed scope decision -- cross-cutting infrastructure, not a primary phase/topic module).',
  sourceDoc: 'docs/testing/2026-09-14_evidence-ledger-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'evidence_ledger')).run();
console.log('Updated evidence_ledger -> real');
