import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, admin-entered B2B co-marketing/partner tracking (6 partner types, prospecting/active/inactive status) -- distinct from influencer_campaigns (creator marketing) and competitor_analysis. No partner-portal/CRM-sync integration exists. Live-verified: real partner created, transitioned to active with a real startedAt timestamp, summary correctly reflected the status change.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_partner-ecosystem-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'partner_ecosystem')).run();
console.log('Updated partner_ecosystem -> real');
