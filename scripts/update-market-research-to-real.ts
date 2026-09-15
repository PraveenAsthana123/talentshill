import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real market-research brief CRUD + Ollama synthesis agent + deterministic readiness pipeline + real Market Research Opportunity Scoring (analyst-entered SOM/competition/risk/strategic-fit inputs -> deterministic 0-100 composite score -> dense cross-brief ranking -> Ollama recommendation narrative, fabrication-guard applied) + customer self-service report.',
  missingItems: 'No real external market-data-provider API integration -- SOM/competition/risk are real analyst judgment inputs, not pulled from a live market-intelligence feed (by design, same as competitor_analysis).',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'market_research')).run();
console.log('Updated market_research -> real');
