import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real 8-dimension numeric scoring (pricing_value, service_breadth, digital_presence, thought_leadership, client_trust_signals, delivery_speed, innovation_ai_adoption, market_reach), admin-entered 0-100 for both a real competitor AND TalentsHill itself, computing a real head-to-head gap per dimension. Extends the pre-existing competitor_analysis module. Live-verified against a real competitor (Microsoft): digital_presence gap correctly computed as 72-90=-18.',
  apiRouteCount: 2,
  hasAdminUi: false,
  missingItems: 'API-only -- no dedicated UI page yet (extends the existing full-10-tab competitor-analysis module rather than adding a new one; scoring UI not yet wired into that module\'s tabs, disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_competitor-benchmark-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'competitor_benchmark_engine')).run();
console.log('Updated competitor_benchmark_engine -> real');
