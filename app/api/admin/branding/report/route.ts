import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('branding', 'read')(async () => {
  const all = db.select().from(schema.brandAssets).orderBy(desc(schema.brandAssets.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAssets: all.length,
    assets: all.map((a) => ({ name: a.name, category: a.category, status: a.status, version: a.version, readinessScore: a.readinessScore ?? null })),
  });
});
