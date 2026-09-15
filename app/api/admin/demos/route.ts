import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { db, schema } from '@/lib/db/index';

export const GET = withPermission('demo_showcase', 'read')(async (_request: NextRequest, _context: unknown) => {
  const rows = db.select().from(schema.demoShowcase).all();
  const demos = rows
    .map((r) => ({
      demoKey: r.demoKey, sourceNum: r.sourceNum, pageRoute: r.pageRoute, name: r.name, flowSummary: r.flowSummary, valueStory: r.valueStory,
      backingModuleKeys: JSON.parse(r.backingModuleKeys) as string[], readiness: r.readiness,
      gapsDisclosed: r.gapsDisclosed, lastVerifiedAt: r.lastVerifiedAt,
    }))
    .sort((a, b) => (a.sourceNum ?? 0) - (b.sourceNum ?? 0));
  return NextResponse.json({
    total: demos.length,
    readyCount: demos.filter((d) => d.readiness === 'ready').length,
    partialCount: demos.filter((d) => d.readiness === 'partial').length,
    notStartedCount: demos.filter((d) => d.readiness === 'not_started').length,
    demos,
  });
});
