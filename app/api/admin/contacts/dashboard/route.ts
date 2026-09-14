import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('contacts', 'read')(async (_request: NextRequest, _context: unknown) => {
  const all = db.select().from(schema.contacts).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'contacts');
  const unscored = all.filter((c) => !c.leadScore || c.leadScore === 0);

  return NextResponse.json({
    kpis: {
      totalContacts: all.length,
      unscored: unscored.length,
      active: all.filter((c) => c.status === 'active').length,
      unsubscribed: all.filter((c) => c.status === 'unsubscribed').length,
      bounced: all.filter((c) => c.status === 'bounced').length,
      avgScore: all.length > 0 ? Math.round(all.reduce((s, c) => s + (c.leadScore || 0), 0) / all.length) : 0,
      totalRuns: runs.length,
      newStage: all.filter((c) => (c.lifecycleStage || 'new') === 'new').length,
      engagedStage: all.filter((c) => c.lifecycleStage === 'engaged').length,
      atRiskStage: all.filter((c) => c.lifecycleStage === 'at_risk').length,
      churnedStage: all.filter((c) => c.lifecycleStage === 'churned').length,
      avgActivationScore: (() => {
        const scored = all.filter((c) => c.activationScore !== null && c.activationScore !== undefined);
        return scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.activationScore || 0), 0) / scored.length) : null;
      })(),
    },
    bySource: all.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.source]: (acc[c.source] ?? 0) + 1 }), {}),
  });
});
