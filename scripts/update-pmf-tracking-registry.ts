import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real Sean-Ellis "how would you feel if you could no longer use TalentsHill" PMF survey + real 40%-threshold score computation -- distinct from the pre-existing survey_responses/scoring.ts (an AI-maturity lead-magnet quiz, confirmed via repo search before building this). Live-verified: 4 real responses (2 very_disappointed) correctly computed 50% score, hasSignal=true (above the real 40% threshold); baseline honestly returned null score with zero responses.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page/survey-collection form yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_pmf-tracking-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'pmf_sean_ellis')).run();
console.log('Updated pmf_sean_ellis -> real');
