import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/appointments-db';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('appointments', 'read')(async () => {
  const all = getAppointments();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'appointments');
  const unscored = all.filter((a) => a.followUpUrgency === undefined);

  return NextResponse.json({
    kpis: {
      totalAppointments: all.length,
      unscored: unscored.length,
      pending: all.filter((a) => a.status === 'pending').length,
      confirmed: all.filter((a) => a.status === 'confirmed').length,
      completed: all.filter((a) => a.status === 'completed').length,
      cancelled: all.filter((a) => a.status === 'cancelled').length,
      avgUrgency: all.length > 0 ? Math.round(all.reduce((s, a) => s + (a.followUpUrgency || 0), 0) / all.length) : 0,
      totalRuns: runs.length,
    },
    byTier: {
      hot: all.filter((a) => a.leadTier === 'hot').length,
      warm: all.filter((a) => a.leadTier === 'warm').length,
      cool: all.filter((a) => a.leadTier === 'cool').length,
      cold: all.filter((a) => a.leadTier === 'cold').length,
    },
  });
});
