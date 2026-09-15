import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, deterministic pre-filter (hot->deep, warm+budget->deep, warm/cool->light, cold->none) that genuinely gates a real costed Ollama call inside lib/agents/lead-qualification-agent.ts -- not just standalone advisory logic. Live-verified: a real cold-tier lead\'s PLAN step correctly skipped its real Ollama call (0 tokens, real cost avoided), while ACT ran normally (206 tokens) -- confirms a measurable behavior change, not a no-op.',
  apiRouteCount: 0,
  hasAdminUi: false,
  missingItems: 'No standalone API endpoint -- wired directly into the existing agentic pipeline (disclosed; the gate itself is the deliverable, not a separate admin surface).',
  sourceDoc: 'docs/testing/2026-09-14_research-depth-router-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'research_depth_router')).run();
console.log('Updated research_depth_router -> real');
