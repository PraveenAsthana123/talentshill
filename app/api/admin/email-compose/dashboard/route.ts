import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('email_compose', 'read')(async () => {
  const all = db.select().from(schema.emailComposeLog).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'email_compose')).all();
  const scored = all.filter((c) => c.readinessScore !== null && c.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalComposeLogs: all.length,
      sent: all.filter((c) => c.sent).length,
      failed: all.filter((c) => !c.sent && c.errorMessage).length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
  });
});
