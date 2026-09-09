import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('health', 'read')(async () => {
  const all = db.select().from(schema.moduleRegistry).orderBy(desc(schema.moduleRegistry.driftScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalModules: all.length,
    modules: all.map((m) => ({
      name: m.name, builtStatus: m.builtStatus, lastVerifiedAt: m.lastVerifiedAt, driftScore: m.driftScore ?? null,
    })),
  });
});
