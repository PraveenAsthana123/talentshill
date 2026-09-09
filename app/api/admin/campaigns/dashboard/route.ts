import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('campaigns', 'read')(async (_request: NextRequest, _context: unknown) => {
  const all = db.select().from(schema.campaigns).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'campaigns');

  const notReady = all.filter((c) => !c.subject || !c.templateId || (c.audienceCount || 0) === 0 || !c.emailProfileId);

  return NextResponse.json({
    kpis: {
      totalCampaigns: all.length,
      draft: all.filter((c) => c.status === 'draft').length,
      scheduled: all.filter((c) => c.status === 'scheduled').length,
      sending: all.filter((c) => c.status === 'sending').length,
      completed: all.filter((c) => c.status === 'completed').length,
      notReadyCount: notReady.length,
      totalSent: all.reduce((s, c) => s + (c.totalSent || 0), 0),
      totalOpened: all.reduce((s, c) => s + (c.totalOpened || 0), 0),
      totalRuns: runs.length,
    },
    notReadyCampaigns: notReady.map((c) => ({ id: c.id, name: c.name, status: c.status })),
  });
});
