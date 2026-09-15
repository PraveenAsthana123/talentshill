import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, deterministic, stored next-best-action (schedule_call/send_pricing/request_budget_info/nurture_email/no_action_cold) computed from real tier+budget rules, distinct from the existing free-text LLM narrative in lead-qualification-agent.ts. Wired into the real lead-scoring-pipeline.ts. Live-verified: a real cold-tier lead correctly got action=no_action_cold.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only -- the pre-existing app/admin/leads page is not yet extended to display the NBA column (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_lead-next-best-action-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'lead_scoring_nba')).run();
console.log('Updated lead_scoring_nba -> real');
