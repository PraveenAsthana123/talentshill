import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('settings', 'read')(async () => {
  const all = db.select().from(schema.siteSettings).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'settings')).all();
  const scored = all.filter((s) => s.qualityScore !== null && s.qualityScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalSettings: all.length,
      everEdited: all.filter((s) => !!s.updatedBy).length,
      unscored: all.length - scored.length,
      avgQualityScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.qualityScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    publicWiringNote: 'Currently wired to real public output: social_linkedin, social_facebook, social_whatsapp (Footer.tsx). Not yet wired: site_name, site_description, contact_email -- see Governance.',
  });
});
