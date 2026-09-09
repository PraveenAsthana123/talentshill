import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('templates', 'read')(async () => {
  const all = db.select().from(schema.emailTemplates).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'templates');
  const scored = all.filter((t) => t.readinessScore !== null && t.readinessScore !== undefined);
  const unscored = all.filter((t) => t.readinessScore === null || t.readinessScore === undefined);

  return NextResponse.json({
    kpis: {
      totalTemplates: all.length,
      active: all.filter((t) => t.isActive).length,
      inactive: all.filter((t) => !t.isActive).length,
      noTextFallback: all.filter((t) => !t.textContent).length,
      unscored: unscored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, t) => s + (t.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byCategory: all.reduce((acc: Record<string, number>, t) => ({ ...acc, [t.category || 'uncategorized']: (acc[t.category || 'uncategorized'] ?? 0) + 1 }), {}),
  });
});
