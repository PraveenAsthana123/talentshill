import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('survey', 'read')(async () => {
  const all = db.select().from(schema.surveyResponses).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'survey');
  const scored = all.filter((r) => r.outreachPriority !== null && r.outreachPriority !== undefined);
  const unscored = all.filter((r) => r.outreachPriority === null || r.outreachPriority === undefined);

  return NextResponse.json({
    kpis: {
      totalResponses: all.length,
      unscored: unscored.length,
      avgOutreachPriority: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.outreachPriority || 0), 0) / scored.length) : 0,
      hasEmail: all.filter((r) => !!r.email).length,
      totalRuns: runs.length,
    },
    byMaturity: {
      beginner: all.filter((r) => r.maturityLevel === 'beginner').length,
      developing: all.filter((r) => r.maturityLevel === 'developing').length,
      advanced: all.filter((r) => r.maturityLevel === 'advanced').length,
      leader: all.filter((r) => r.maturityLevel === 'leader').length,
    },
  });
});
