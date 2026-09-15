import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real Demand Map (industry/interest-area tallies from real contact_submissions) and Funnel Constraint (weakest real stage-to-stage conversion across unqualified/mql/sql/opportunity/customer). Live-verified against 160 real submissions: correctly found the real degenerate sql->opportunity=0% constraint.',
  apiRouteCount: 1,
  hasAdminUi: true,
  missingItems: 'Funnel Constraint assumes monotonic stage progression (no separate stage-transition-history log exists) -- disclosed in the admin UI itself.',
  sourceDoc: 'docs/testing/2026-09-14_business-diagnostic-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'business_diagnostic')).run();
console.log('Updated business_diagnostic -> real');
