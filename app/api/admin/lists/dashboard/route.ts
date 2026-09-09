import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('lists', 'read')(async () => {
  const all = db.select().from(schema.lists).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'lists')).all();
  const dynamicLists = all.filter((l) => l.type === 'dynamic');
  const neverSynced = dynamicLists.filter((l) => !l.lastSyncedAt);

  return NextResponse.json({
    kpis: {
      totalLists: all.length,
      staticLists: all.filter((l) => l.type === 'static').length,
      dynamicLists: dynamicLists.length,
      dynamicNeverSynced: neverSynced.length,
      totalMembers: all.reduce((s, l) => s + (l.memberCount || 0), 0),
      totalRuns: runs.length,
    },
  });
});
