import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('integrations', 'read')(async () => {
  const integrations = db.select().from(schema.integrations).all();
  const accounts = db.select().from(schema.integrationAccounts).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'integrations')).all();
  const scored = accounts.filter((a) => a.readinessScore !== null && a.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalIntegrations: integrations.length,
      totalAccounts: accounts.length,
      connected: accounts.filter((a) => a.status === 'connected').length,
      withErrors: accounts.filter((a) => !!a.errorMessage).length,
      unscored: accounts.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byCategory: integrations.reduce((acc: Record<string, number>, i) => ({ ...acc, [i.category]: (acc[i.category] ?? 0) + 1 }), {}),
  });
});
