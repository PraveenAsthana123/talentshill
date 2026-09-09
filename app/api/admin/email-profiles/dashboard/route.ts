import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('email_profiles', 'read')(async () => {
  const all = db.select().from(schema.emailProfiles).all();
  const smtpLinks = db.select().from(schema.emailProfileSmtp).all();
  const linkedProfileIds = new Set(smtpLinks.map((l) => l.profileId));
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'email_profiles')).all();
  const scored = all.filter((p) => p.readinessScore !== null && p.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalProfiles: all.length,
      active: all.filter((p) => p.isActive).length,
      withoutSmtp: all.filter((p) => !linkedProfileIds.has(p.id)).length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, p) => s + (p.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
  });
});
