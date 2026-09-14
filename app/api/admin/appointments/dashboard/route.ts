import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/appointments-db';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('appointments', 'read')(async () => {
  const all = getAppointments();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'appointments');
  const unscored = all.filter((a) => a.followUpUrgency === undefined);
  const webinars = db.select().from(schema.webinars).all();
  const registrants = db.select().from(schema.webinarRegistrants).all();
  const attended = registrants.filter((r) => r.attended === true);
  const qualified = registrants.filter((r) => r.qualificationTier === 'hot' || r.qualificationTier === 'warm');
  const pipelineLinked = registrants.filter((r) => r.contactSubmissionId !== null && r.contactSubmissionId !== undefined);

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
      totalWebinars: webinars.length,
      totalRegistrants: registrants.length,
      attendedCount: attended.length,
      qualifiedFromWebinars: qualified.length,
      pipelineLinkedCount: pipelineLinked.length,
    },
    byTier: {
      hot: all.filter((a) => a.leadTier === 'hot').length,
      warm: all.filter((a) => a.leadTier === 'warm').length,
      cool: all.filter((a) => a.leadTier === 'cool').length,
      cold: all.filter((a) => a.leadTier === 'cold').length,
    },
    byRegistrantTier: registrants.reduce((acc: Record<string, number>, r) => {
      if (!r.qualificationTier) return acc;
      return { ...acc, [r.qualificationTier]: (acc[r.qualificationTier] ?? 0) + 1 };
    }, {}),
  });
});
