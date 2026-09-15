import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { db, schema } from '@/lib/db/index';

export const GET = withPermission('demo_showcase', 'read')(async (_request: NextRequest, _context: unknown) => {
  const rows = db.select().from(schema.demoShowcase).all();
  return NextResponse.json({
    demos: rows.map((r) => ({
      demoKey: r.demoKey, name: r.name, flowSummary: r.flowSummary, valueStory: r.valueStory,
      backingModuleKeys: JSON.parse(r.backingModuleKeys) as string[], readiness: r.readiness,
      gapsDisclosed: r.gapsDisclosed, lastVerifiedAt: r.lastVerifiedAt,
    })),
  });
});
