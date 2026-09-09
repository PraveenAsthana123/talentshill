import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('leads', 'read')(async (_request: NextRequest, _context: unknown) => {
  const all = db.select().from(schema.contactSubmissions).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'leads');

  const unscored = all.filter((l) => !l.leadScore || l.leadScore === 0);

  return NextResponse.json({
    kpis: {
      totalLeads: all.length,
      unscored: unscored.length,
      hot: all.filter((l) => l.leadTier === 'hot').length,
      warm: all.filter((l) => l.leadTier === 'warm').length,
      cool: all.filter((l) => l.leadTier === 'cool').length,
      cold: all.filter((l) => l.leadTier === 'cold').length,
      newStatus: all.filter((l) => l.status === 'new').length,
      contacted: all.filter((l) => l.status === 'contacted').length,
      qualified: all.filter((l) => l.status === 'qualified').length,
      closed: all.filter((l) => l.status === 'closed').length,
      totalRuns: runs.length,
    },
  });
});
